import QuickGoalForm from "@/app/_components/QuickGoalForm";
import { Title } from "@/app/_components/Typography";

export default async function NewGoalPage() {
  return (
    <>
      <Title>Add Goal</Title>
      <QuickGoalForm />
    </>
  );
}
