'use server';

import { GoalTransfer } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import db from './db/db';

const dateFormat = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|(\+|-)\d{2}:\d{2})$/,
    'Invalid ISO 8601 date time format'
  );
const transferSchema = z.object({
  itemName: z.string(),
  amount: z.coerce.number(),
  transactedAt: dateFormat,

  link: z.string().url().optional(),
  note: z.string().optional(),
  merchantName: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  goalId: z.string().uuid().optional(),
  plaidCategory: z.string().optional(),
});

export type GoalTransferFieldErrors = {
  fieldErrors: {
    link?: string[];
    note?: string[];
    itemName?: string[];
    merchantName?: string[];
    amount?: string[];
    rating?: string[];
    transactedAt?: string[];
    categoryId?: string[];
    goalId?: string[];
  };
};

export async function addQuickSave(
  goalId: string,
  transfer: GoalTransfer
): Promise<GoalTransfer> {
  const goalTransfer = await db.goalTransfer.create({
    data: {
      goalId,
      transactedAt: new Date(),
      updatedAt: new Date(),

      userId: transfer.userId,
      rating: transfer.rating,
      categoryId: transfer.categoryId,
      plaidCategory: transfer.plaidCategory,
      note: transfer.note,
      link: transfer.link,
      imagePath: transfer.imagePath,
      itemName: transfer.itemName,
      merchantName: transfer.merchantName,
      amount: transfer.amount,
    },
  });

  revalidatePath('/');
  revalidatePath('/savings');
  revalidatePath('/goals');

  return goalTransfer;
}

export async function updateGoalTransfer(
  id: string,
  formData: FormData
): Promise<GoalTransfer | GoalTransferFieldErrors> {
  const result = transferSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!result.success) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const existingTransfer = await db.goalTransfer.findUnique({
    where: { id },
  });

  if (!existingTransfer) return notFound();

  const data = result.data;
  let transactedAt: Date | undefined = undefined;
  if (data.transactedAt) transactedAt = new Date(data.transactedAt);
  const updatedTransfer = await db.goalTransfer.update({
    where: { id },
    data: {
      link: data.link,
      note: data.note,
      itemName: data.itemName,
      merchantName: data.merchantName,
      goalId: data.goalId,
      updatedAt: new Date(),
      amount: data.amount,
      plaidCategory: data.plaidCategory,
      rating: data.rating,
      transactedAt,
    },
  });

  revalidatePath('/');
  revalidatePath('/savings');
  return updatedTransfer;
}
export async function addGoalTransfer(
  userId: string,
  isTemplate: boolean,
  formData: FormData
): Promise<GoalTransfer | GoalTransferFieldErrors> {
  const result = transferSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!result.success) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const data = result.data;
  const goalTransfer = await db.goalTransfer.create({
    data: {
      userId: userId,
      goalId: data.goalId,
      rating: data.rating,
      plaidCategory: data.plaidCategory,
      note: data.note,
      link: data.link,
      imagePath: '',
      updatedAt: new Date(),
      itemName: data.itemName,
      merchantName: data.merchantName,
      amount: data.amount,
      transactedAt: data.transactedAt,
      pinned: isTemplate,
    },
  });

  revalidatePath('/');
  revalidatePath('/savings');
  return goalTransfer;
}

export async function addQuickGoalTransfer(
  userId: string,
  goalTransferType: string | null | undefined,
  formData: FormData
): Promise<GoalTransfer | GoalTransferFieldErrors | { noPinnedGoal: boolean }> {
  const result = transferSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!result.success) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }
  const data = result.data;

  let categoryId = undefined;
  let userPinGoalId = undefined;
  let updatedAt = new Date();
  let transactedAt: Date | undefined = updatedAt;
  // if (goalTransferType === 'accounts') categoryId = externalAccountId;
  if (goalTransferType === 'templates') transactedAt = undefined;
  if (goalTransferType !== 'templates' && data.amount > 0) {
    userPinGoalId = (
      await db.goal.findFirst({
        where: { userId: userId, pinned: true },
      })
    )?.id;

    if (!userPinGoalId) return { noPinnedGoal: true };
  }

  const goalTransfer = await db.goalTransfer.create({
    data: {
      userId,
      categoryId,
      goalId: userPinGoalId,
      updatedAt,
      transactedAt,
      initialTransfer: goalTransferType === 'accounts',
      rating: data.rating,
      itemName: data.itemName,
      amount: data.amount,
      pinned: goalTransferType === 'templates',
    },
  });

  revalidatePath('/');
  revalidatePath('/savings');
  return goalTransfer;
}

export async function deleteGoalTransfer(
  id: string
): Promise<GoalTransfer | typeof notFound> {
  const deletedTransfer = await db.goalTransfer.delete({
    where: { id },
  });

  if (!deletedTransfer) return notFound();

  revalidatePath('/');
  revalidatePath('/savings');
  return deletedTransfer;
}
