import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

import db from "@/db/db";
import { isExtendedSession } from "@/lib/session";
import { GoalTransferForm } from "@/app/_components/GoalTransferForm";
import authOptions from "@/lib/nextAuthOptions";
import { baseURL } from "@/lib/utils";
import { Title } from "@/app/_components/Typography";
import { Goal, GoalCategory, GoalTransfer } from "@prisma/client";

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
const getGoalTransfer = (goalTransferId: string) => {
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
  if (!isExtendedSession(session)) return;

  let goalTransfer: any | undefined;
  if (goalTransferId) goalTransfer = await getGoalTransfer(goalTransferId);

  const [categories, goals] = await Promise.all([
    getCategories(),
    getGoals(session.user.id),
  ]);

  return (
    <>
      <Title>{title}</Title>
      <GoalTransferForm
        isSavings={isSavings}
        categories={categories}
        goalTransfer={goalTransfer}
        goals={goals}
      />
    </>
  );
}
