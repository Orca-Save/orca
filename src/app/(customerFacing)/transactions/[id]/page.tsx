import TransactionForm from '../_components/TransactionForm';

export default async function TransactionPage({
  params: { id },
}: {
  params: { id: string };
}) {
  return (
    <>
      <div>Edit {id}</div>
      <TransactionForm />
    </>
  );
}
