"use server";

import { revalidatePath } from "next/cache";

export async function resetCache() {
  revalidatePath("/");
  revalidatePath("/savings");
  revalidatePath("/goals");
}
