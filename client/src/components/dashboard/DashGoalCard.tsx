import CompletedCounts from '../shared/CompletedCounts';

const getGoalTransfersSum = (userId: string) => {
  return db.goalTransfer.groupBy({
    by: ['goalId'],
    _sum: {
      amount: true,
    },
    _count: {
      goalId: true,
    },
    where: {
      goal: {
        userId: userId,
      },
    },
  });
};

export default async function DashGoalCard({ userId }: { userId: string }) {
  const [goal, sums, completedCounts] = await Promise.all([
    getPinnedUserGoal(userId),
    getGoalTransfersSum(userId),
    completedUserGoalCount(userId),
  ]);
  if (!goal)
    return (
      <CompletedCounts
        totalSaved={completedCounts.totalSaved}
        goalsCompleted={completedCounts.goalsCompleted}
      />
    );

  const goalSumMap = new Map(
    sums.map((item) => [
      item.goalId,
      { amount: item._sum.amount, count: item._count.goalId },
    ])
  );
  let goalDetail = Object.assign(goal, {
    currentBalance: goalSumMap.get(goal.id)?.amount?.toNumber() || 0,
    savedItemCount: goalSumMap.get(goal.id)?.count || 0,
  });
  return (
    <GoalCard
      revalidatePath='/'
      goal={goalDetail}
      hideActions={true}
      userHasPinnedGoal={true}
    />
  );
}
