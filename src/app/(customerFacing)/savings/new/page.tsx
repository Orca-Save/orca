import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

import db from "@/db/db";
import { cache } from "@/lib/cache";
import { isExtendedSession } from "@/lib/session";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { GoalTransferForm } from "@/app/_components/GoalTransferForm";
import authOptions from "@/lib/nextAuthOptions";

const getCategories = cache(() => {
  return db.goalCategory.findMany({
    orderBy: { name: "asc" },
  });
}, ["/savings", "getCategories"]);

const getGoals = cache(
  (userId: string) => {
    return db.goal.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  },
  ["/savings", "getGoals"]
);

export default async function NewGoalTransferPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: window.location.origin + "/goals" });
    return;
  }
  if (!isExtendedSession(session)) return;

  const [categories, goals] = await Promise.all([
    getCategories(),
    getGoals(session.user.id),
  ]);

  return (
    <>
      <PageHeader>Add Saving</PageHeader>
      <GoalTransferForm categories={categories} goals={goals} />
    </>
  );
}
