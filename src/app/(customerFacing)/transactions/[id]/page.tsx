import { Title } from '@/app/_components/Typography';
import db from '@/db/db';
import TransactionForm from '../_components/TransactionForm';

export default async function TransactionPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const transaction = await db.transaction.findUnique({
    where: { transactionId: id },
  });
  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <>
      <Title level={3}>Edit Transaction</Title>
      <TransactionForm transaction={transaction} />
    </>
  );
}
