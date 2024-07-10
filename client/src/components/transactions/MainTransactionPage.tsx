import {
  getFormattedTransactions,
  getUnreadTransactionCount,
} from '@/app/_actions/plaid';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ReviewLink from '../plaid/ReviewLink';
import TransactionList from './components/TransactionList';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');
  const [formattedTransactions, unreadObj] = await Promise.all([
    getFormattedTransactions(session.user.id),
    getUnreadTransactionCount(session.user.id),
  ]);

  return (
    <>
      <ReviewLink unreadObj={unreadObj} userId={session.user.id} />
      <TransactionList transactions={formattedTransactions} />
    </>
  );
}
