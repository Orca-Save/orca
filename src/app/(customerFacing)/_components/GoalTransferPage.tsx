import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

import { GoalTransferForm } from "@/app/_components/GoalTransferForm";
import { Title } from "@/app/_components/Typography";
import db from "@/db/db";
import authOptions from "@/lib/nextAuthOptions";
import { isExtendedSession } from "@/lib/session";
import { baseURL } from "@/lib/utils";
import { headers } from "next/headers";

const getCategories = () => {
  return db.goalCategory.findMany({
    orderBy: { name: "asc" },
  });
};
const getGoals = (userId: string) => {
  return db.goal.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
};
const getGoalTransfer = (goalTransferId?: string) => {
  if (!goalTransferId) return null;
  return db.goalTransfer.findUnique({
    where: { id: goalTransferId },
  });
};
export default async function GoalTransferPage({
  title,
  isSavings,
  goalTransferId,
}: {
  title: string;
  isSavings: boolean;
  goalTransferId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: baseURL + "/goals" });
    return;
  }
  const headersList = headers();
  const referer = headersList.get("referer");
  if (!isExtendedSession(session)) return;

  const [categories, goals, goalTransfer] = await Promise.all([
    getCategories(),
    getGoals(session.user.id),
    getGoalTransfer(goalTransferId),
  ]);

  return (
    <>
      <Title>{title}</Title>
      <GoalTransferForm
        isSavings={isSavings}
        referer={referer!}
        categories={categories}
        goalTransfer={goalTransfer}
        goals={goals}
      />
    </>
  );
}
