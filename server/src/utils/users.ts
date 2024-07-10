import { Goal, GoalTransfer } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import db from './db/db';
export const getPinnedUserGoal = (userId: string) => {
  return db.goal.findFirst({
    where: {
      userId,
      pinned: true,
    },
  });
};

export async function setGoalPinned(goalId: string, pinned: boolean) {
  const goal = await db.goal.update({
    where: { id: goalId },
    data: {
      pinned,
    },
  });

  revalidatePath('/');
  revalidatePath('/savings');
  revalidatePath('/goals');
  return goal;
}

export async function setGoalTransferPinned(goalId: string, pinned: boolean) {
  const goalTransfer = await db.goalTransfer.update({
    where: { id: goalId },
    data: {
      pinned,
    },
  });

  revalidatePath('/');
  revalidatePath('/savings');
  revalidatePath('/goals');
  return goalTransfer;
}

export const completedUserGoalCount = async (userId: string) => {
  // get all the goals for the user
  const goals = await db.goal.findMany({
    where: {
      userId,
    },
  });
  if (goals.length === 0) return { totalSaved: 0, goalsCompleted: 0 };

  // get the total positive GoalTransfers for each goal
  const goalTransfers = await db.goalTransfer.findMany({
    where: {
      goalId: {
        in: goals.map((goal) => goal.id),
      },
    },
  });
  if (goalTransfers.length === 0) return { totalSaved: 0, goalsCompleted: 0 };

  // sum them up for each goal
  const goalSums = goals.map((goal) => {
    return goalTransfers
      .filter((transfer) => transfer.goalId === goal.id)
      .reduce((acc, transfer) => acc + transfer.amount.toNumber(), 0);
  });

  // count the goals that are complete
  const goalsCompleted = goalSums.filter(
    (sum, i) => sum >= goals[i].targetAmount.toNumber()
  ).length;

  // return the total saved overall, and the goals completed
  return {
    totalSaved: goalSums.reduce((acc, sum) => acc + sum, 0),
    goalsCompleted,
  };
};
type Item = Goal | GoalTransfer;
export function sortPins(a: Item, b: Item) {
  if (a.pinned && !b.pinned) {
    return -1;
  }
  if (b.pinned && !a.pinned) {
    return 1;
  }

  if (a.updatedAt < b.updatedAt) {
    return 1;
  } else if (a.updatedAt > b.updatedAt) {
    return -1;
  }
  return 0;
}
