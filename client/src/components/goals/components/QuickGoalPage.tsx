import QuickGoalForm from "@/app/_components/QuickGoalForm";
import { Title } from "@/app/_components/Typography";
import { headers } from "next/headers";

export default async function NewGoalPage() {
  const headersList = headers();
  const referer = headersList.get("referer");

  return (
    <>
      <Title>Add Goal</Title>
      <QuickGoalForm referer={referer!} />
    </>
  );
}
