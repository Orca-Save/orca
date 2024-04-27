import QuickSaveForm from "@/app/_components/QuickSaveForm";
import { Title } from "@/app/_components/Typography";
import { headers } from "next/headers";

export default async function QuickSavePage() {
  const headersList = headers();
  const referer = headersList.get("referer");
  return (
    <div>
      <Title level={2}>Add Save</Title>
      <QuickSaveForm referer={referer!} isSavings={true} />
    </div>
  );
}
