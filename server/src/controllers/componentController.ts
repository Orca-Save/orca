import { Request, Response } from 'express';

import { User } from '../types/user';
import { appInsightsClient } from '../utils/appInsights';
import { getUserProfile, getUserTour } from '../utils/db/common';
import { getGoalTransfersSum } from '../utils/goalTransfers';
import { getSubscription } from '../utils/stripe';
import { completedUserGoalCount, getPinnedUserGoal } from '../utils/users';

export const goalCard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    let [goal, sums, userTour, completedCounts] = await Promise.all([
      getPinnedUserGoal(user.oid),
      getGoalTransfersSum(user.oid),
      getUserTour(user.oid),
      completedUserGoalCount(user.oid),
    ]);
    const goalSumMap = new Map(
      sums.map((item) => [
        item.goalId,
        { amount: item._sum.amount, count: item._count.goalId },
      ])
    );
    if (goal) {
      Object.assign(goal, {
        currentBalance: goalSumMap.get(goal.id)?.amount?.toNumber() || 0,
        savedItemCount: goalSumMap.get(goal.id)?.count || 0,
      });
    }
    res.status(200).send({ completedCounts, userTour, goal });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const subscription = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const userId = user.oid;
    let [userProfile, subscription] = await Promise.all([
      getUserProfile(userId),
      getSubscription(userId),
    ]);
    res.status(200).send({ userProfile, subscription });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};
