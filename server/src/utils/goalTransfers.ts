import { GoalTransfer } from '@prisma/client';
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
export const getGoalTransfersSum = (userId: string) => {
  return db.goalTransfer.groupBy({
    by: ['goalId'],
    _sum: {
      amount: true,
    },
    _count: {
      goalId: true,
    },
    where: {
      goal: {
        userId: userId,
      },
    },
  });
};
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
export async function getPinnedGoalTransfers(userId: string) {
  return (
    await db.goalTransfer.findMany({
      where: {
        userId,
        pinned: true,
      },
      include: {
        category: true,
      },
    })
  ).map((transfer) =>
    Object.assign(transfer, {
      category: transfer.category?.name,
      amount: transfer.amount.toNumber(),
    })
  );
}

export async function addQuickSave(
  userId: string,
  goalId: string,
  transferId: string
): Promise<GoalTransfer> {
  const goalTransfer = await db.goalTransfer.findUnique({
    where: { id: transferId },
  });
  if (!goalTransfer) throw Error('Goal Transfer not found');
  if (goalTransfer.userId !== userId) throw Error('Unauthorized');

  const goal = await db.goal.findUnique({
    where: { id: goalId },
  });
  if (!goal) throw Error('Goal not found');
  if (goal.userId !== userId) throw Error('Unauthorized');

  const newGoalTransfer = await db.goalTransfer.create({
    data: {
      goalId,
      transactedAt: new Date(),
      updatedAt: new Date(),

      userId: goalTransfer.userId,
      rating: goalTransfer.rating,
      categoryId: goalTransfer.categoryId,
      plaidCategory: goalTransfer.plaidCategory,
      note: goalTransfer.note,
      link: goalTransfer.link,
      imagePath: goalTransfer.imagePath,
      itemName: goalTransfer.itemName,
      merchantName: goalTransfer.merchantName,
      amount: goalTransfer.amount,
    },
  });

  return newGoalTransfer;
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

  if (!existingTransfer) throw Error('Not found');

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

  return goalTransfer;
}

export async function deleteGoalTransfer(id: string): Promise<GoalTransfer> {
  const deletedTransfer = await db.goalTransfer.delete({
    where: { id },
  });

  if (!deletedTransfer) throw Error('Not found');
  return deletedTransfer;
}
