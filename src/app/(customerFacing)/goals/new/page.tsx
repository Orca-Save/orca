import { PageHeader } from "@/app/admin/_components/PageHeader";
import { GoalForm } from "@/app/_components/GoalForm";
import db from "@/db/db";
import { cache } from "@/lib/cache";

const getCategories = () => {
  return db.goalCategory.findMany({
    orderBy: { name: "asc" },
  });
};

export default async function NewGoalPage() {
  const categories = await getCategories();
  return (
    <>
      <PageHeader>Add Goal</PageHeader>
      <GoalForm categories={categories} />
    </>
  );
}
