import { GoalForm } from "@/app/_components/GoalForm";
import { Title } from "@/app/_components/Typography";
import db from "@/db/db";
import { headers } from "next/headers";

const getCategories = () => {
  return db.goalCategory.findMany({
    orderBy: { name: "asc" },
  });
};

export default async function EditGoalPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const headersList = headers();
  const referer = headersList.get("referer");
  const [goal, categories] = await Promise.all([
    db.goal.findUnique({ where: { id } }),
    getCategories(),
  ]);

  let initialAmount: number | undefined = undefined;
  if (goal?.initialTransferId)
    initialAmount = (
      await db.goalTransfer.findFirst({
        where: { id: goal.initialTransferId },
      })
    )?.amount.toNumber();

  return (
    <>
      <Title>Edit Goal</Title>
      <GoalForm
        goal={goal}
        referer={referer!}
        categories={categories}
        initialAmount={initialAmount}
      />
    </>
  );
}
