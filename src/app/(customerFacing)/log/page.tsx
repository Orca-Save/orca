import { completedUserGoalCount } from '@/app/_actions/users';
import db from '@/db/db';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { GoalTransfer } from '@prisma/client';
import { Tabs, TabsProps } from 'antd';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ConfettiComp from '../_components/Confetti';
import SavingsPage from '../_components/SavingsPage';
import ReviewTab from './_components/ReviewTab';

const getGoalTransfers = (userId: string) => {
  return db.goalTransfer.findMany({
    where: {
      userId,
    },
    include: { category: true },
    orderBy: { transactedAt: 'desc' },
  });
};

export default async function MySavingsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !isExtendedSession(session)) redirect('/');

  const [goalTransfers, completedCounts] = await Promise.all([
    getGoalTransfers(session.user.id),
    completedUserGoalCount(session.user.id),
  ]);
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Impulse Saves',
      children: (
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
      ),
    },
    {
      key: '2',
      label: 'One-Taps',
      children: (
        <SavingsPage
          totalSaved={completedCounts.totalSaved}
          goalsCompleted={completedCounts.goalsCompleted}
          topGoalTransfers={goalTransfers.filter((transfer) => transfer.pinned)}
          bottomGoalTransfers={goalTransfers.filter(
            (transfer) =>
              !transfer.goalId &&
              !transfer.pinned &&
              transfer.amount.toNumber() > 0
          )}
          saveHref='/savings/new'
          newSaveText='Add One-Tap Save'
          filter='templates'
        />
      ),
    },
    {
      key: '3',
      label: 'Transactions',
      children: <ReviewTab userId={session.user.id} />,
    },
  ];
  return (
    <>
      <ConfettiComp run={searchParams?.confetti === 'true'} path='/savings' />
      <Tabs centered defaultActiveKey='1' items={items} />
    </>
  );
}
