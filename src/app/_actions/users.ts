"use server";

import db from "@/db/db";
import { revalidatePath } from "next/cache";

export async function setGoalPinned(goalId: string, pinned: boolean) {
  const goal = await db.goal.update({
    where: { id: goalId },
    data: {
      pinned,
    },
  });

  revalidatePath("/");
  revalidatePath("/savings");
  revalidatePath("/goals");
  return goal;
}

export async function setGoalTransferPinned(goalId: string, pinned: boolean) {
  const goalTransfer = await db.goalTransfer.update({
    where: { id: goalId },
    data: {
      pinned,
    },
  });

  revalidatePath("/");
  revalidatePath("/savings");
  revalidatePath("/goals");
  return goalTransfer;
}
