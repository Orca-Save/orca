'use server';

import db from '@/db/db';
import { externalAccountId } from '@/lib/goalTransfers';
import { Goal } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { uploadFile } from './storage';

const fileSchema = z.instanceof(File, { message: 'Required' });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith('image/')
);
export type GoalFieldErrors = {
  fieldErrors: {
    name?: string[];
    description?: string[];
    targetAmount?: string[];
    initialAmount?: string[];
    categoryId?: string[];
    note?: string[];
    dueAt?: string[];
  };
};

const dueAtSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|(\+|-)\d{2}:\d{2})$/,
    'Invalid ISO 8601 date time format'
  );
const goalSchema = z.object({
  dueAt: dueAtSchema,
  name: z.string().min(1),
  targetAmount: z.coerce.number().min(1),

  note: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  plaidCategory: z.string().optional(),
  initialAmount: z.coerce.number().min(1).optional(),
  image: imageSchema.optional(),
  imagePath: z.string().optional(),
  file: fileSchema.optional(),
});

const quickGoalSchema = z.object({
  dueAt: dueAtSchema,
  name: z.string().min(1),
  targetAmount: z.coerce.number().min(1),

  initialAmount: z.coerce.number().min(1).optional(),
});

export async function addQuickGoal(
  userId: string,
  prevState: unknown,
  formData: FormData
): Promise<GoalFieldErrors | Goal> {
  const result = quickGoalSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (result.success === false) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const data = result.data;
  let goal = await db.goal.create({
    data: {
      userId,
      name: data.name,
      updatedAt: new Date(),
      targetAmount: data.targetAmount,
      dueAt: data.dueAt,
    },
  });

  if (data.initialAmount && data.initialAmount > 0) {
    await db.goalTransfer.create({
      data: {
        userId,
        goalId: goal.id,
        categoryId: externalAccountId,
        initialTransfer: true,
        updatedAt: new Date(),
        itemName: `${data.name} Initial Deposit`,
        amount: data.initialAmount,
        transactedAt: new Date(),
      },
    });
    revalidatePath('/savings');
  }

  revalidatePath('/');
  revalidatePath('/goals');
  return goal;
}

export async function addGoal(
  userId: string,
  prevState: unknown,
  formData: FormData
): Promise<GoalFieldErrors | Goal> {
  const result = goalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const data = result.data;

  let imagePath = data.imagePath;
  if (data.image) {
    const { blockBlobClient } = await uploadFile(data.image);
    imagePath = blockBlobClient.url;
  }

  let goal = await db.goal.create({
    data: {
      userId,
      name: data.name,
      note: data.note,
      description: data.description,
      updatedAt: new Date(),
      targetAmount: data.targetAmount,
      categoryId: data.categoryId,
      plaidCategory: data.plaidCategory,
      dueAt: data.dueAt,
      imagePath,
    },
  });

  if (data.initialAmount && data.initialAmount > 0) {
    const initialTransfer = await db.goalTransfer.create({
      data: {
        userId,
        goalId: goal.id,
        rating: 5,
        categoryId: externalAccountId,
        plaidCategory: data.plaidCategory,
        initialTransfer: true,
        note: '',
        link: '',
        imagePath: '',
        updatedAt: new Date(),
        itemName: `${data.name} Initial Deposit`,
        merchantName: '',
        amount: data.initialAmount,
        transactedAt: new Date(),
      },
    });

    await db.goal.update({
      data: { initialTransferId: initialTransfer.id },
      where: { id: goal.id },
    });
    revalidatePath('/savings');
  }

  revalidatePath('/');
  revalidatePath('/goals');
  return goal;
}

export async function updateGoal(
  id: string,
  userId: string,
  prevState: unknown,
  formData: FormData
): Promise<GoalFieldErrors | Goal> {
  const result = goalSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const data = result.data;

  const goal = await db.goal.findUnique({ where: { id } });
  if (goal?.initialTransferId) {
    await db.goalTransfer.update({
      data: { amount: data.initialAmount },
      where: { id: goal?.initialTransferId },
    });

    revalidatePath('/savings');
  }

  if (goal == null) return notFound();

  let imagePath = data.imagePath;
  if (data.image) {
    const { blockBlobClient } = await uploadFile(data.image);
    imagePath = blockBlobClient.url;
  }

  let updatedGoal = await db.goal.update({
    where: { id },
    data: {
      userId,
      name: data.name,
      note: data.note,
      description: data.description,
      updatedAt: new Date(),
      targetAmount: data.targetAmount,
      categoryId: data.categoryId,
      plaidCategory: data.plaidCategory,
      dueAt: data.dueAt,
      imagePath,
    },
  });

  revalidatePath('/');
  revalidatePath('/goals');
  return updatedGoal;
}

export async function deleteGoal(id: string) {
  // update goal transfers to remove goalId
  await db.goalTransfer.updateMany({
    where: { goalId: id },
    data: { goalId: null },
  });
  const goal = await db.goal.delete({ where: { id } });

  if (goal == null) return notFound();

  revalidatePath('/');
  revalidatePath('/goals');
  return goal;
}
