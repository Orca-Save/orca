import { Title } from '@/app/_components/Typography';
import db from '@/db/db';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import TransactionForm from '../../log/transactions/_components/TransactionForm';

export default async function TransactionPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');
  const transaction = await db.transaction.findUnique({
    where: { transactionId: id },
  });
  if (!transaction) {
    return redirect('/');
  }
  if (transaction.userId !== session.user.id) {
    return redirect('/');
  }

  return (
    <>
      <Title level={3}>Edit Transaction</Title>
      <TransactionForm transaction={transaction} />
    </>
  );
}
