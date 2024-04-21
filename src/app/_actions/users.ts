"use server";

import db from "@/db/db";
import { revalidatePath as revalPath } from "next/cache";
import { notFound } from "next/navigation";

export async function createUserPin(
  userId: string,
  typeId: string,
  type: string,
  revalidatePath: string
) {
  const userPin = await db.userPin.create({
    data: {
      userId,
      typeId: typeId,
      type,
    },
  });

  revalPath(revalidatePath);
  return userPin;
}

export async function deleteUserPin(id: string, revalidatePath: string) {
  const userPin = await db.userPin.delete({
    where: { id },
  });

  if (userPin == null) {
    notFound();
    return;
  }

  revalPath(revalidatePath);
  return userPin;
}
