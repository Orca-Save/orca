import { Space, Typography } from 'antd';
import React from 'react';
import { Goal } from '../../types/all';
import GoalCard from '../shared/GoalCard';

const { Title } = Typography;

type GoalListProps = {
  goals: Goal[];
  userTour?: boolean;
};
export default function GoalsList({ goals, userTour }: GoalListProps) {
  const pinnedGoals = goals.filter((x) => x.pinned);
  const userHasPinnedGoal = pinnedGoals.length > 0;
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
          userTour={userTour}
          revalidatePath='/goals'
          userHasPinnedGoal={userHasPinnedGoal}
          goal={goal}
        />
      ))}
      <Space className='center-space'>
        <Title level={4}>{goals.length ? 'Goals' : 'No Goals'}</Title>
      </Space>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {goals
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
