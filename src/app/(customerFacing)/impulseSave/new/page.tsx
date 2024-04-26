import QuickSaveForm from "@/app/_components/QuickSaveForm";
import { Title } from "@/app/_components/Typography";

export default async function QuickSavePage() {
  return (
    <div>
      <Title level={2}>Quick Save</Title>
      <QuickSaveForm isSavings={true} />
    </div>
  );
}
