import { Request, Response } from 'express';
import db from '../utils/db';
import { getUserProfile } from '../utils/db/common';
import { getPinnedGoalTransfers } from '../utils/goalTransfers';
import { getUnreadTransactionCount } from '../utils/plaid';
import { getPinnedUserGoal } from '../utils/users';

export const dashboardPage = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const onboardProfileCount = await db.onboardingProfile.count({
      where: {
        userId: userId,
      },
    });
    const unreadTransactionCount = await getUnreadTransactionCount(userId);
    const userProfile = await getUserProfile(userId);

    res
      .status(200)
      .send({ onboardProfileCount, unreadTransactionCount, userProfile });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const quickSaveButtons = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const [quickTransfers, goal] = await Promise.all([
      getPinnedGoalTransfers(userId),
      getPinnedUserGoal(userId),
    ]);

    res.status(200).send({ goal, quickTransfers });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting quick save buttons' });
  }
};
