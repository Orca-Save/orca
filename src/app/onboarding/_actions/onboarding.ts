'use server';

import { syncItems } from '@/app/_actions/plaid';
import db from '@/db/db';
import { externalAccountId } from '@/lib/goalTransfers';
import dayjs from 'dayjs';
import { revalidatePath } from 'next/cache';
import { onboardingSchema } from '../_schemas/onboarding';

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

  revalidatePath('/');
  revalidatePath('/user');
  revalidatePath('/goals');
  revalidatePath('/savings');
  return onboardingProfile;
}
