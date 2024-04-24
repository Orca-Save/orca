import { GoalForm } from "@/app/_components/GoalForm";
import { Title } from "@/app/_components/Title";
import db from "@/db/db";

const getCategories = () => {
  return db.goalCategory.findMany({
    orderBy: { name: "asc" },
  });
};

export default async function NewGoalPage() {
  const categories = await getCategories();
  return (
    <>
      <Title>Add Goal</Title>
      <GoalForm categories={categories} />
    </>
  );
}
