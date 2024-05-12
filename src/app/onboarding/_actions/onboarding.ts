"use server";

import db from "@/db/db";
import { externalAccountId } from "@/lib/goalTransfers";
import dayjs from "dayjs";
import { onboardingSchema } from "../_schemas/onboarding";

export async function onboardUser(userId: string, onboardingProfileInput: any) {
  onboardingProfileInput.goalDueAt = dayjs(onboardingProfileInput.goalDueAt);
  const result = onboardingSchema.safeParse(onboardingProfileInput);

  if (result.success === false) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const onboardingProfileData = result.data;
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

  let initialAmountTransfer;
  if (onboardingProfileData.initialAmount) {
    initialAmountTransfer = await db.goalTransfer.create({
      data: {
        userId: userId,
        goalId: goal.id,
        amount: onboardingProfileData.initialAmount,
        transactedAt: new Date(),
        itemName: onboardingProfileData.goalName + " Initial Amount",
        categoryId: externalAccountId,
      },
    });
  }

  const defaultGoalTransfers = [
    {
      itemName: "Skipped the coffee shop",
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

  let saveGoalTransfer;
  if (onboardingProfileData.savingAmount && onboardingProfileData.saving) {
    saveGoalTransfer = await db.goalTransfer.create({
      data: {
        userId: userId,
        amount: onboardingProfileData.savingAmount,
        itemName: onboardingProfileData.saving,
        pinned: true,
      },
    });
  }

  const onboardingProfile = await db.onboardingProfile.create({
    data: {
      ...onboardingProfileData,
      goalDueAt: onboardingProfileData.goalDueAt.format(),
      userId: userId,
      goalId: goal.id,
      savingTransferId: saveGoalTransfer?.id,
      initialTransferId: initialAmountTransfer?.id,
    },
  });

  return { goal, onboardingProfile, saveGoalTransfer, initialAmountTransfer };
}
