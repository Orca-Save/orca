import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { getUnreadTransactions } from '../_actions/plaid';
import UnreadTransactionsSwiper from '../_components/UnreadTransactionsSwiper';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');

  const [unreadTransactions] = await Promise.all([
    getUnreadTransactions(session.user.id),
  ]);

  return (
    <div style={{ height: '100%' }}>
      <UnreadTransactionsSwiper
        userId={session.user.id}
        initialTransactions={unreadTransactions}
      />
    </div>
  );
}
