import { revalidatePath } from 'next/cache';

import dayjs, { Dayjs } from 'dayjs';
import { z } from 'zod';
import db from './db/db';
import { sendSlackMessage } from './general';
import { syncItems } from './plaid';
const zodDay = z.custom<Dayjs>((val) => val instanceof dayjs, 'Invalid date');

export const externalAccountId = 'faed4327-3a9c-4837-a337-c54e9704d60f';

export const onboardingSchema = z.object({
  goalName: z.string().min(1),
  goalAmount: z.coerce.number().min(0),
  goalDueAt: zodDay,

  imagePath: z
    .string()
    .nullable()
    .optional()
    .refine((value) => value !== null && value !== undefined, {
      message: 'Search for an image to visualize your goal!',
    }),
  id: z.string().optional(),
  privacyAgreement: z.boolean().optional(),
  saving: z.string().min(1).nullable().optional(),
  savingAmount: z.coerce.number().min(0).optional(),
  initialAmount: z.coerce.number().min(0).optional(),
});

export async function getOnboardingProfile(userId: string) {
  const onboardingProfile = await db.onboardingProfile.findFirst({
    where: { userId },
  });
  return onboardingProfile;
}

export async function saveOnboardingProfile(
  userId: string,
  onboardingProfileInput: any
) {
  onboardingProfileInput.goalDueAt = dayjs(onboardingProfileInput.goalDueAt);
  const result = onboardingSchema.safeParse(onboardingProfileInput);

  if (result.success === false) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const onboardingProfileData = result.data;
  const privacyAgreement = onboardingProfileData.privacyAgreement;
  delete onboardingProfileData.privacyAgreement;
  const onboardingProfile = await db.onboardingProfile.upsert({
    where: { userId },
    create: {
      ...onboardingProfileData,
      goalDueAt: onboardingProfileData.goalDueAt.format(),
      userId: userId,
    },
    update: {
      ...onboardingProfileData,
      goalDueAt: onboardingProfileData.goalDueAt.format(),
    },
  });

  if (privacyAgreement)
    await db.userProfile.upsert({
      where: { userId },
      create: { userId, privacyPolicyAccepted: privacyAgreement },
      update: {
        privacyPolicyAccepted: privacyAgreement,
        updatedAt: new Date(),
      },
    });

  return { onboardingProfile };
}

async function createDefaultOneTaps(userId: string) {
  const defaultGoalTransfers = [
    {
      itemName: 'Skipped the coffee shop',
      amount: 6.5,
    },
  ];

  for (let { itemName, amount } of defaultGoalTransfers) {
    await db.goalTransfer.create({
      data: {
        amount,
        itemName,
        pinned: true,
        userId: userId,
      },
    });
  }
}

export async function onboardUser(userId: string, onboardingProfileInput: any) {
  onboardingProfileInput.goalDueAt = dayjs(onboardingProfileInput.goalDueAt);
  const result = onboardingSchema.safeParse(onboardingProfileInput);

  if (result.success === false) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const onboardingProfileData = result.data;
  const currentOnboardingProfile = await db.onboardingProfile.findFirst({
    where: { id: onboardingProfileData.id },
  });

  let goalId = currentOnboardingProfile?.goalId;

  if (!goalId) {
    const goal = await db.goal.create({
      data: {
        userId: userId,
        name: onboardingProfileData.goalName,
        targetAmount: onboardingProfileData.goalAmount,
        dueAt: onboardingProfileData.goalDueAt.format(),
        pinned: true,
        imagePath: onboardingProfileData.imagePath,
      },
    });
    goalId = goal.id;

    await createDefaultOneTaps(userId);
  }

  let initialAmountTransfer;
  if (
    !currentOnboardingProfile?.initialTransferId &&
    onboardingProfileData.initialAmount
  ) {
    initialAmountTransfer = await db.goalTransfer.create({
      data: {
        userId: userId,
        goalId: goalId,
        amount: onboardingProfileData.initialAmount,
        transactedAt: new Date(),
        itemName: onboardingProfileData.goalName + ' Initial Amount',
        categoryId: externalAccountId,
        initialTransfer: true,
      },
    });
  }

  let saveGoalTransferId = currentOnboardingProfile?.savingTransferId;
  if (
    !saveGoalTransferId &&
    onboardingProfileData.savingAmount &&
    onboardingProfileData.saving
  ) {
    const saveGoalTransfer = await db.goalTransfer.create({
      data: {
        userId: userId,
        amount: onboardingProfileData.savingAmount,
        itemName: onboardingProfileData.saving,
        pinned: true,
      },
    });
    saveGoalTransferId = saveGoalTransfer.id;
  }

  delete onboardingProfileData.privacyAgreement;
  const onboardingProfile = await db.onboardingProfile.update({
    where: { userId },
    data: {
      ...onboardingProfileData,
      goalDueAt: onboardingProfileData.goalDueAt.format(),
      userId: userId,
      goalId: goalId,
      savingTransferId: saveGoalTransferId,
      initialTransferId: initialAmountTransfer?.id,
    },
  });

  await syncItems(userId);

  if (process.env.NODE_ENV === 'production') {
    await sendSlackMessage(
      session?.user?.email +
        ' has completed onboarding with the goal ' +
        onboardingProfileData.goalName +
        ' for $' +
        onboardingProfileData.goalAmount.toFixed(2) +
        ' by ' +
        onboardingProfileData.goalDueAt.locale() +
        '.'
    );
  }

  revalidatePath('/');
  revalidatePath('/user');
  revalidatePath('/goals');
  revalidatePath('/savings');
  return onboardingProfile;
}
