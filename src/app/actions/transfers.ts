"use server";

import db from "@/db/db";

export async function userTransferExists(email: string, goalId: string) {
  return (
    (await db.saving.findFirst({
      where: { user: { email }, goalId },
      select: { id: true },
    })) != null
  );
}
