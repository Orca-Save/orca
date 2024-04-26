import QuickSaveForm from "@/app/_components/QuickSaveForm";
import { Title } from "@/app/_components/Typography";

export default async function QuickSavePage() {
  return (
    <div>
      <Title level={2}>Impulse Buy</Title>
      <QuickSaveForm isSavings={false} />
    </div>
  );
}
