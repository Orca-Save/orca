import QuickSaveForm from "@/app/_components/QuickSaveForm";
import { Title } from "@/app/_components/Typography";
import { headers } from "next/headers";

export default async function ImpulseBuyPage() {
  const headersList = headers();
  const referer = headersList.get("referer");
  return (
    <div>
      <Title level={2}>Add Impulse Buy</Title>
      <QuickSaveForm
        itemNameTitle="Item Name"
        itemNamePlaceholder="ex: Starbucks Iced Latte"
        referer={referer!}
        isSavings={false}
      />
    </div>
  );
}
