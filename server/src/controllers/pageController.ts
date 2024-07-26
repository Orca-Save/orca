import { Request, Response } from 'express';
import { getUserProfile } from '../utils/db/common';
import { getPinnedGoalTransfers } from '../utils/goalTransfers';
import { getOnboardingProfileCount } from '../utils/onboarding';
import { getUnreadTransactionCount } from '../utils/plaid';
import { getPinnedUserGoal } from '../utils/users';

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
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};
