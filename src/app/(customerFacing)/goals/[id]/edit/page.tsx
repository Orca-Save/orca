import { GoalForm } from "@/app/_components/GoalForm";
import { Title } from "@/app/_components/Typography";
import db from "@/db/db";

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
  const [goal, categories] = await Promise.all([
    db.goal.findUnique({ where: { id } }),
    getCategories(),
  ]);

  return (
    <>
      <Title>Edit Goal</Title>
      <GoalForm goal={goal} categories={categories} />
    </>
  );
}
