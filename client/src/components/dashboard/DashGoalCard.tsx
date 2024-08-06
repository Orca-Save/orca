import { Goal } from '../../types/all';
import CompletedCounts from '../shared/CompletedCounts';
import GoalCard from '../shared/GoalCard';

export default function DashGoalCard({
  completedCounts,
  goal,
}: {
  goal: Goal | null;
  completedCounts: { totalSaved: number; goalsCompleted: number };
}) {
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
