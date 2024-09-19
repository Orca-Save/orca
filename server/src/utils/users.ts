import { Goal, GoalTransfer, UserTour } from '@prisma/client';
import db from './db/db';
import { cancelSubscription } from './googleCloud';
export const getPinnedUserGoal = (userId: string) => {
  return db.goal.findFirst({
    where: {
      userId,
      pinned: true,
    },
  });
};

export async function setGoalPinned(
  userId: string,
  goalId: string,
  pinned: boolean
) {
  const goal = await db.goal.findUnique({
    where: { id: goalId },
  });
  if (!goal) throw Error('Goal not found');
  if (goal.userId !== userId) throw Error('Unauthorized');
  const updatedGoal = await db.goal.update({
    where: { id: goalId },
    data: {
      pinned,
    },
  });

  return updatedGoal;
}

export async function setGooglePaySubscriptionToken(
  userId: string,
  token: string
) {
  if (!token) throw Error('Token is required');

  const updatedUser = await db.userProfile.update({
    where: { userId },
    data: {
      googlePaySubscriptionToken: token,
      subscriptionEnd: null,
    },
  });
  await db.userPurchaseToken.upsert({
    where: { userId, token },
    update: {
      token,
    },
    create: {
      token,
      userId,
    },
  });

  return updatedUser;
}

export async function cancelGoogleSubscription(userId: string) {
  const userProfile = await db.userProfile.findUnique({
    where: { userId },
  });
  if (!userProfile) throw Error('User not found');
  if (!userProfile.googlePaySubscriptionToken) throw Error('Token is required');

  await cancelSubscription(userProfile.googlePaySubscriptionToken);
}

export async function updateTour(userId: string, tour: UserTour) {
  const updatedTour = await db.userTour.upsert({
    where: { userId },
    update: {
      ...tour,
      updatedAt: new Date(),
    },
    create: {
      ...tour,
      userId,
    },
  });

  return updatedTour;
}

export async function setGoalTransferPinned(
  userId: string,
  transferId: string,
  pinned: boolean
) {
  const goalTransfer = await db.goalTransfer.findUnique({
    where: { id: transferId },
  });
  if (!goalTransfer) throw Error('Goal Transfer not found');
  if (goalTransfer.userId !== userId) throw Error('Unauthorized');

  const updatedGoalTransfer = await db.goalTransfer.update({
    where: { id: transferId },
    data: {
      pinned,
    },
  });

  return updatedGoalTransfer;
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
