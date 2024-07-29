import { Tabs, TabsProps } from 'antd';

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
  const [goalTransfers, completedCounts] = await Promise.all([
    getGoalTransfers(session.user.id),
    completedUserGoalCount(session.user.id),
  ]);
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Log',
      children: (
        <SavingsPage
          totalSaved={completedCounts.totalSaved}
          goalsCompleted={completedCounts.goalsCompleted}
          bottomGoalTransfers={goalTransfers.filter(
            (transfer) =>
              transfer.goalId !== null || transfer.amount.toNumber() < 0
          )}
          saveHref='/savings/new'
          newSaveText='Impulse Save'
        />
      ),
    },
    {
      key: '2',
      label: 'One-Tap',
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
      label: 'Non-Impulse',
      children: (
        <SavingsPage
          totalSaved={completedCounts.totalSaved}
          goalsCompleted={completedCounts.goalsCompleted}
          bottomGoalTransfers={goalTransfers.filter(
            (transfer) => transfer.initialTransfer === true
          )}
          saveHref='/savings/new?filter=templates'
          newSaveText='New External Account'
          filter='accounts'
          hide={true}
        />
      ),
    },
  ];
  return (
    <>
      <ConfettiComp run={searchParams?.confetti === 'true'} path='/savings' />
      <Tabs centered defaultActiveKey='1' items={items} />
    </>
  );
}