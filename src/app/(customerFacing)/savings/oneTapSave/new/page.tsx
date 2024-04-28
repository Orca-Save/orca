import QuickSaveForm from "@/app/_components/QuickSaveForm";
import { Title } from "@/app/_components/Typography";
import { headers } from "next/headers";

export default async function OneTapPage() {
  const headersList = headers();
  const referer = headersList.get("referer");
  return (
    <div>
      <Title level={2}>Add One-Tap Save</Title>
      <QuickSaveForm
        itemNameTitle="Action"
        itemNamePlaceholder="ex: Made lunch at home"
        referer={referer!}
        isSavings={true}
      />
    </div>
  );
}
