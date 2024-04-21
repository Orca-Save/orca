"use server";

import db from "@/db/db";
import { z } from "zod";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { GoalTransfer } from "@prisma/client";

const transferSchema = z.object({
  link: z.string().url(),
  note: z.string(),
  itemName: z.string(),
  merchantName: z.string(),
  amountInCents: z.coerce.number().int(),
  rating: z.coerce.number().int().min(1).max(5),
  transactedAt: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|(\+|-)\d{2}:\d{2})$/,
      "Invalid ISO 8601 datetime format"
    ),
  goalId: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
});

export type GoalTransferFieldErrors = {
  fieldErrors: {
    link?: string[];
    note?: string[];
    itemName?: string[];
    merchantName?: string[];
    amountInCents?: string[];
    rating?: string[];
    transactedAt?: string[];
    categoryId?: string[];
    goalId?: string[];
  };
};

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
      amountInCents: data.amountInCents,
      transactedAt: new Date(data.transactedAt),
    },
  });

  revalidatePath("/");
  revalidatePath("/savings");
  return goalTransfer;
}

export async function updateGoalTransfer(
  id: string,
  userId: string,
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
  const updatedTransfer = await db.goalTransfer.update({
    where: { id },
    data: {
      link: data.link,
      note: data.note,
      itemName: data.itemName,
      merchantName: data.merchantName,
      updatedAt: new Date(),
      amountInCents: data.amountInCents,
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
