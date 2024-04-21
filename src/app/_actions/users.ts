"use server";

import db from "@/db/db";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export async function createUserPin(
  userId: string,
  typeId: string,
  type: string
) {
  const userPin = await db.userPin.create({
    data: {
      userId,
      typeId: typeId,
      type,
    },
  });

  revalidatePath("/");
  revalidatePath("/savings");
  revalidatePath("/goals");
  return userPin;
}

export async function deleteUserPin(id: string) {
  const userPin = await db.userPin.delete({
    where: { id },
  });

  if (userPin == null) {
    notFound();
    return;
  }
  revalidatePath("/");
  revalidatePath("/savings");
  revalidatePath("/goals");
  return userPin;
}
