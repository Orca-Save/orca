import GoalTransferPage from "@/app/(customerFacing)/_components/GoalTransferPage";

export default async function NewSavingsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <GoalTransferPage goalTransferId={id} isSavings={true} title="Edit Save" />
  );
}
