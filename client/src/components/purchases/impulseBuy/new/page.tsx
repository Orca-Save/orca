import QuickGoalForm from "@/app/_components/QuickGoalForm";
import { Title } from "@/app/_components/Typography";
import { headers } from "next/headers";

export default async function ImpulseBuyPage() {
  const headersList = headers();
  const referer = headersList.get("referer");
  return (
    <div>
      <Title level={2}>Add Impulse Buy</Title>
      <QuickGoalForm referer={referer!} />
    </div>
  );
}
