import { getFormattedTransactions } from '@/app/_actions/plaid';
import { getPinnedUserGoal } from '@/app/_actions/users';
import authOptions from '@/lib/nextAuthOptions';
import { discretionaryFilter } from '@/lib/plaid';
import { isExtendedSession } from '@/lib/session';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import UnreadTransactionsSwiper from './_components/UnreadTransactionsSwiper';

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');

  const [formattedTransactions, pinnedUserGoal] = await Promise.all([
    getFormattedTransactions(session.user.id, false),
    getPinnedUserGoal(session.user.id),
  ]);

  return (
    <>
      <UnreadTransactionsSwiper
        userId={session.user.id}
        focusGoalImgURL={pinnedUserGoal?.imagePath ?? ''}
        formattedTransactions={formattedTransactions.filter(
          discretionaryFilter
        )}
      />
    </>
  );
}
