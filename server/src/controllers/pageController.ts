import { Request, Response } from 'express';

import db from '../utils/db';
import { getUserProfile } from '../utils/db/common';
import { getPinnedGoalTransfers } from '../utils/goalTransfers';
import {
  getOnboardingProfile,
  getOnboardingProfileCount,
} from '../utils/onboarding';
import {
  createLinkToken,
  getAllLinkedItems,
  getFormattedTransactions,
  getUnreadTransactionCount,
} from '../utils/plaid';
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
      goalTransfers,
      completedCounts,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};
export const transactionsPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [formattedTransactions, unreadObj] = await Promise.all([
      getFormattedTransactions(userId),
      getUnreadTransactionCount(userId),
    ]);
    res.status(200).send({ formattedTransactions, unreadObj });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};

export const onboardingPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [linkToken, userProfile, itemsData, onboardingProfile] =
      await Promise.all([
        createLinkToken(userId),
        getUserProfile(userId),
        getAllLinkedItems(userId),
        getOnboardingProfile(userId),
      ]);
    res
      .status(200)
      .send({ linkToken, userProfile, itemsData, onboardingProfile });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};
export const transactionPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const transactionId = req.body.transactionId;

    const transaction = await db.transaction.findUnique({
      where: {
        userId,
        transactionId,
      },
    });
    if (!transaction) throw new Error('Transaction not found');
    const account = await db.account.findUnique({
      where: { id: transaction.accountId },
    });
    res.status(200).send({ transaction, account });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};
