"use server";

import db from "@/db/db";
import { externalAccountId } from "@/lib/goalTransfers";
import { onboardingSchema } from "../_schemas/onboarding";

export async function onboardUser(userId: string, onboardingProfileInput: any) {
  onboardingProfileInput.goalDueAt = new Date(onboardingProfileInput.goalDueAt);
  const onboardingProfileData = onboardingSchema.parse(onboardingProfileInput);

  const goal = await db.goal.create({
    data: {
      userId: userId,
      name: onboardingProfileData.goalName,
      targetAmount: onboardingProfileData.goalAmount,
      dueAt: onboardingProfileData.goalDueAt,
      pinned: true,
    },
  });

  const actionGoalTransfer = await db.goalTransfer.create({
    data: {
      userId: userId,
      amount: onboardingProfileData.actionAmount,
      itemName: onboardingProfileData.action,
      pinned: true,
    },
  });

  const saveGoalTransfer = await db.goalTransfer.create({
    data: {
      userId: userId,
      amount: onboardingProfileData.savingAmount,
      itemName: onboardingProfileData.saving,
      pinned: true,
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

  await db.onboardingProfile.create({
    data: {
      ...onboardingProfileData,
      userId: userId,
      goalId: goal.id,
      savingTransferId: saveGoalTransfer.id,
      actionTransferId: actionGoalTransfer.id,
      initialTransferId: initialAmountTransfer?.id,
    },
  });
}
