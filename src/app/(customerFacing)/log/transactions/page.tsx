import { getFormattedTransactions } from '@/app/_actions/plaid';
import { getUnreadTransactionCount } from '@/app/_actions/users';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ReviewLink from '../../_components/ReviewLink';
import TransactionList from '../_components/TransactionList';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');
  const [formattedTransactions, unreadObj] = await Promise.all([
    getFormattedTransactions(session.user.id),
    getUnreadTransactionCount(session.user.id),
  ]);

  return (
    <>
      <ReviewLink unreadObj={unreadObj} />

      <TransactionList transactions={formattedTransactions} />
    </>
  );
}
