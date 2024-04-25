import db from "@/db/db";
import { Title } from "@/app/_components/Typography";

export default async function EditGoalPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const goal = await db.goal.findUnique({ where: { id } });

  return (
    <>
      <Title>Edit Goal</Title>
      {/* <GoalForm goal={goal}  /> */}
    </>
  );
}
