import { Request, Response } from 'express';

import { getUserProfile } from '../utils/db/common';
import { getPinnedGoalTransfers } from '../utils/goalTransfers';
import { getOnboardingProfileCount } from '../utils/onboarding';
import { getUnreadTransactionCount } from '../utils/plaid';
import { getGoalTransfers } from '../utils/transactions';
import { completedUserGoalCount, getPinnedUserGoal } from '../utils/users';

export const dashboardPage = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const [
      onboardingProfileCount,
      quickTransfers,
      goal,
      unreadTransactionCount,
      userProfile,
    ] = await Promise.all([
      getOnboardingProfileCount(userId),
      getPinnedGoalTransfers(userId),
      getPinnedUserGoal(userId),
      getUnreadTransactionCount(userId),
      getUserProfile(userId),
    ]);
    res.status(200).send({
      onboardingProfileCount,
      quickTransfers,
      goal,
      unreadTransactionCount,
      userProfile,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};
export const savingsPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [goalTransfers, completedCounts] = await Promise.all([
      getGoalTransfers(userId),
      completedUserGoalCount(userId),
    ]);
    res.status(200).send({
      goalTransfers: goalTransfers.filter(
        (transfer) => transfer.goalId !== null || transfer.amount.toNumber() < 0
      ),
      completedCounts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};
