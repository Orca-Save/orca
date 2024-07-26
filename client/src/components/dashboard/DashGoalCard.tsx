import React from 'react';
import useFetch from '../../hooks/useFetch';
import CompletedCounts from '../shared/CompletedCounts';
import GoalCard from '../shared/GoalCard';

export default function DashGoalCard() {
  const { data } = useFetch('api/components/goalCard', 'GET');
  if (!data) return null;
  const { goal, completedCounts } = data;
  if (!goal)
    return (
      <CompletedCounts
        totalSaved={completedCounts.totalSaved}
        goalsCompleted={completedCounts.goalsCompleted}
      />
    );

  return (
    <GoalCard
      revalidatePath='/'
      goal={goal}
      hideActions={true}
      userHasPinnedGoal={true}
    />
  );
}
