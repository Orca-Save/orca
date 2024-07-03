import { completedUserGoalCount } from '@/app/_actions/users';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { GoalTransfer } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import SavingsPage from '../../_components/SavingsPage';
import { getGoalTransfers } from '../_actions/transactions';

export default async function SavesPage() {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');

  const [goalTransfers, completedCounts] = await Promise.all([
    getGoalTransfers(session.user.id),
    completedUserGoalCount(session.user.id),
  ]);
  return (
    <SavingsPage
      totalSaved={completedCounts.totalSaved}
      goalsCompleted={completedCounts.goalsCompleted}
      bottomGoalTransfers={goalTransfers.filter(
        (transfer: GoalTransfer) =>
          transfer.goalId !== null || transfer.amount.toNumber() < 0
      )}
      saveHref='/savings/new'
      newSaveText='Impulse Save'
    />
  );
}
