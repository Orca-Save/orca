"use server";

import db from "@/db/db";
import { externalAccountId } from "@/lib/goalTransfers";
import { UserPinType } from "@/lib/users";
import { GoalTransfer } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";

const transferSchema = z.object({
  itemName: z.string(),
  amount: z.coerce.number(),
  link: z.string().url().optional(),
  note: z.string().optional(),
  merchantName: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  goalId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
});

const updateTransferSchema = z.object({
  link: z.string().url().optional(),
  note: z.string().optional(),
  itemName: z.string(),
  merchantName: z.string().optional(),
  amount: z.coerce.number(),
  rating: z.coerce.number().int().min(1).max(5),
  transactedAt: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|(\+|-)\d{2}:\d{2})$/,
      "Invalid ISO 8601 date time format"
    ),
  goalId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
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
      note: transfer.note,
      link: transfer.link,
      imagePath: transfer.imagePath,
      itemName: transfer.itemName,
      merchantName: transfer.merchantName,
      amount: transfer.amount,
    },
  });

  revalidatePath("/");
  revalidatePath("/savings");
  revalidatePath("/goals");

  return goalTransfer;
}

export async function addGoalTransfer(
  userId: string,
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
      categoryId: data.categoryId,
      note: data.note,
      link: data.link,
      imagePath: "",
      updatedAt: new Date(),
      itemName: data.itemName,
      merchantName: data.merchantName,
      amount: data.amount,
      transactedAt: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/savings");
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
  if (goalTransferType === "accounts") {
    categoryId = externalAccountId;
  }
  if (goalTransferType !== "templates" && data.amount > 0) {
    userPinGoalId = (
      await db.userPin.findFirst({
        where: { userId: userId, type: UserPinType.Goal },
      })
    )?.typeId;

    if (!userPinGoalId) return { noPinnedGoal: true };
  }

  const goalTransfer = await db.goalTransfer.create({
    data: {
      userId: userId,
      goalId: userPinGoalId,

      rating: data.rating,
      itemName: data.itemName,
      amount: data.amount,

      updatedAt: new Date(),
      transactedAt: new Date(),
    },
  });

  if (goalTransferType === "templates") {
    await db.userPin.create({
      data: {
        userId: userId,
        typeId: goalTransfer.id,
        type: UserPinType.GoalTransfer,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/savings");
  return goalTransfer;
}

export async function updateGoalTransfer(
  id: string,
  formData: FormData
): Promise<GoalTransfer | GoalTransferFieldErrors> {
  const result = updateTransferSchema.safeParse(
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
      categoryId: data.categoryId,
      rating: data.rating,
      transactedAt: new Date(data.transactedAt),
    },
  });

  revalidatePath("/");
  revalidatePath("/savings");
  return updatedTransfer;
}

export async function deleteGoalTransfer(
  id: string
): Promise<GoalTransfer | typeof notFound> {
  const deletedTransfer = await db.goalTransfer.delete({
    where: { id },
  });

  if (!deletedTransfer) return notFound();

  revalidatePath("/");
  revalidatePath("/savings");
  return deletedTransfer;
}
