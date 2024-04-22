import db from "@/db/db";
import { PageHeader } from "../../../_components/PageHeader";
import { GoalForm } from "../../../../_components/GoalForm";

export default async function EditGoalPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const goal = await db.goal.findUnique({ where: { id } });

  return (
    <>
      <PageHeader>Edit Goal</PageHeader>
      {/* <GoalForm goal={goal}  /> */}
    </>
  );
}
