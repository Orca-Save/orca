import { getServerSession } from "next-auth";
import { signIn } from "next-auth/react";

import db from "@/db/db";
import { isExtendedSession } from "@/lib/session";
import { GoalTransferForm } from "@/app/_components/GoalTransferForm";
import authOptions from "@/lib/nextAuthOptions";
import { baseURL } from "@/lib/utils";
import { Title } from "@/app/_components/Typography";

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

export default async function GoalTransferPage({
  title,
  isSavings,
}: {
  title: string;
  isSavings: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn("azure-ad-b2c", { callbackUrl: baseURL + "/goals" });
    return;
  }
  if (!isExtendedSession(session)) return;

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
        goals={goals}
      />
    </>
  );
}
