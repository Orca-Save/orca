import { Title } from '@/app/_components/Typography';
import authOptions from '@/lib/nextAuthOptions';
import { isExtendedSession } from '@/lib/session';
import { sortPins } from '@/lib/users';
import { baseURL } from '@/lib/utils';
import { Space } from 'antd';
import { getServerSession } from 'next-auth';
import { signIn } from 'next-auth/react';
import db from '../../../../../server/src/db/db';
import GoalCard from '../../../../../src/app/(customerFacing)/_components/GoalCard';

const getGoals = (userId: string) => {
  return db.goal.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
  });
};
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

export default async function GoalsSuspense() {
  const session = await getServerSession(authOptions);
  if (!session) {
    signIn('azure-ad-b2c', { callbackUrl: baseURL + '/goals' });
    return;
  }

  if (isExtendedSession(session)) {
    let [goals, sums] = await Promise.all([
      getGoals(session.user.id),
      getGoalTransfersSum(session.user.id),
    ]);
    const goalSumMap = new Map(
      sums.map((item) => [
        item.goalId,
        { amount: item._sum.amount, count: item._count.goalId },
      ])
    );
    const userHasPinnedGoal = goals.some((goal) => goal.pinned);
    const goalsWithDetails = goals
      .map((goal) => ({
        ...goal,
        currentBalance: goalSumMap.get(goal.id)?.amount?.toNumber() || 0,
        savedItemCount: goalSumMap.get(goal.id)?.count || 0,
      }))
      .sort(sortPins);
    const pinnedGoals = goalsWithDetails.filter((x) => x.pinned);
    return (
      <Space direction='vertical' className='w-full'>
        <Space className='center-space'>
          <Title level={4}>
            {pinnedGoals.length ? 'Focus Goal' : 'No Focus Goal'}
          </Title>
        </Space>
        {pinnedGoals.map((goal) => (
          <GoalCard
            key={goal.id}
            revalidatePath='/goals'
            userHasPinnedGoal={userHasPinnedGoal}
            goal={goal}
          />
        ))}
        <Space className='center-space'>
          <Title level={4}>
            {goalsWithDetails.length ? 'Goals' : 'No Goals'}
          </Title>
        </Space>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {goalsWithDetails
            .filter((x) => !x.pinned)
            .map((goal) => (
              <GoalCard
                key={goal.id}
                revalidatePath='/goals'
                userHasPinnedGoal={userHasPinnedGoal}
                goal={goal}
              />
            ))}
        </div>
      </Space>
    );
  }
  return <Title> Sign in required</Title>;
}
