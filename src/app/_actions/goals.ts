"use server";

import db from "@/db/db";
import { z } from "zod";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Goal } from "@prisma/client";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(
  (file) => file.size === 0 || file.type.startsWith("image/")
);
export type GoalFieldErrors = {
  fieldErrors: {
    name?: string[];
    description?: string[];
    targetInCents?: string[];
    categoryId?: string[];
    note?: string[];
    dueAt?: string[];
  };
};

const dueAtSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|(\+|-)\d{2}:\d{2})$/,
    "Invalid ISO 8601 datetime format"
  );
const addSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  balanceInCents: z.coerce.number().int().min(0),
  targetInCents: z.coerce.number().int().min(1),
  categoryId: z.string().uuid(),
  note: z.string(),
  dueAt: dueAtSchema,
});

export async function addGoal(
  userId: string,
  prevState: unknown,
  formData: FormData
): Promise<GoalFieldErrors | Goal> {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const data = result.data;
  let goal = await db.goal.create({
    data: {
      userId,
      name: data.name,
      note: data.note,
      description: data.description,
      updatedAt: new Date(),
      targetInCents: data.targetInCents,
      categoryId: data.categoryId,
      dueAt: data.dueAt,
      imagePath: "",
    },
  });

  revalidatePath("/");
  revalidatePath("/goals");
  return goal;
}

const editSchema = addSchema.extend({
  file: fileSchema.optional(),
  image: imageSchema.optional(),
});

export async function updateGoal(
  id: string,
  userId: string,
  prevState: unknown,
  formData: FormData
): Promise<GoalFieldErrors | Goal> {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return { fieldErrors: result.error.formErrors.fieldErrors };
  }

  const data = result.data;
  const goal = await db.goal.findUnique({ where: { id } });

  if (goal == null) return notFound();

  let imagePath = goal.imagePath;

  let updatedGoal = await db.goal.update({
    where: { id },
    data: {
      userId,
      name: data.name,
      note: data.note,
      description: data.description,
      updatedAt: new Date(),
      targetInCents: data.targetInCents,
      categoryId: data.categoryId,
      dueAt: data.dueAt,
      imagePath,
    },
  });

  revalidatePath("/");
  revalidatePath("/goals");
  return updatedGoal;
}

export async function deleteGoal(id: string) {
  const goal = await db.goal.delete({ where: { id } });

  if (goal == null) return notFound();

  revalidatePath("/");
  revalidatePath("/goals");
  return goal;
}
