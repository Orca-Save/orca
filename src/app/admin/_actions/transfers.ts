"use server";

import db from "@/db/db";
import { notFound } from "next/navigation";

export async function deleteTransfer(id: string) {
  const saving = await db.saving.delete({
    where: { id },
  });

  if (saving == null) return notFound();

  return saving;
}
