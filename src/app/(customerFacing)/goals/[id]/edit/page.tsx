import { PageHeader } from "@/app/admin/_components/PageHeader";
import { GoalForm } from "@/app/_components/GoalForm";
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
    await getCategories(),
  ]);

  return (
    <>
      <PageHeader>Edit Goal</PageHeader>
      <GoalForm goal={goal} categories={categories} />
    </>
  );
}
