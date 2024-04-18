import { PageHeader } from "@/app/admin/_components/PageHeader";
import { GoalForm } from "@/app/admin/goals/_components/GoalForm";
import db from "@/db/db";

export default async function EditGoalPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const goal = await db.goal.findUnique({ where: { id } });

  return (
    <>
      <PageHeader>Edit Goal</PageHeader>
      <GoalForm goal={goal} />
    </>
  );
}
