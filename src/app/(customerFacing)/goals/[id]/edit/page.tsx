import { GoalForm } from "@/app/_components/GoalForm";
import { Title } from "@/app/_components/Typography";
import db from "@/db/db";
import { cache } from "@/lib/cache";

const getCategories = cache(() => {
  return db.goalCategory.findMany({
    orderBy: { name: "asc" },
  });
}, ["/", "getCategories"]);

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
