import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

import db from "@/db/db";
import { cache } from "@/lib/cache";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isExtendedSession } from "@/lib/session";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { GoalTransferForm } from "@/app/_components/GoalTransferForm";

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
const getGoalTransfer = (id: string) => {
  return db.goalTransfer.findUnique({
    where: { id },
  });
};
export default async function NewGoalTransferPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: "/goals" });
    return;
  }
  if (!isExtendedSession(session)) return;

  const [categories, goals, goalTransfer] = await Promise.all([
    getCategories(),
    getGoals(session.user.id),
    getGoalTransfer(id),
  ]);

  if (!goalTransfer) {
    return <div>Goal transfer not found</div>;
  }

  return (
    <>
      <PageHeader>Add Saving</PageHeader>
      <GoalTransferForm
        categories={categories}
        goals={goals}
        goalTransfer={goalTransfer}
      />
    </>
  );
}
