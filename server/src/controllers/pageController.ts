import { Request, Response } from 'express';

import { appInsightsClient } from '../utils/appInsights';
import {
  getCurrentMonthDailySums,
  getLastMonthDiscretionaryTotal,
  getWeekChartData,
} from '../utils/chart';
import db from '../utils/db';
import { getUserProfile, getUserTour } from '../utils/db/common';
import {
  getGoalTransfersSum,
  getPinnedGoalTransfers,
} from '../utils/goalTransfers';
import { getGoogleSubscriptionStatus } from '../utils/googleCloud';
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
import { getStripeSubscription } from '../utils/stripe';
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
      userTour,
      sums,
      completedCounts,
      subscriptionPrice,
    ] = await Promise.all([
      getOnboardingProfileCount(userId),
      getPinnedGoalTransfers(userId),
      getPinnedUserGoal(userId),
      getUnreadTransactionCount(userId),
      getUserProfile(userId),
      getUserTour(userId),
      getGoalTransfersSum(userId),
      completedUserGoalCount(userId),
      getGoogleSubscriptionStatus(userId),
      // getSubscriptionPriceById(),
    ]);

    console.log(subscriptionPrice);
    if (goal) {
      const goalSumMap = new Map(
        sums.map((item) => [
          item.goalId,
          { amount: item._sum.amount, count: item._count.goalId },
        ])
      );
      Object.assign(goal, {
        currentBalance: goalSumMap.get(goal.id)?.amount?.toNumber() || 0,
        savedItemCount: goalSumMap.get(goal.id)?.count || 0,
      });
    }
    res.status(200).send({
      onboardingProfileCount,
      quickTransfers,
      goal,
      userTour,
      unreadTransactionCount,
      userProfile,
      completedCounts,
    });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
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
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};

export const chartPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const lastMonthDiscretionary = await getLastMonthDiscretionaryTotal(userId);
    const [weekChartData, currentMonthDailySums] = await Promise.all([
      getWeekChartData(userId),
      getCurrentMonthDailySums(userId, lastMonthDiscretionary),
    ]);

    res
      .status(200)
      .send({ weekChartData, currentMonthDailySums, lastMonthDiscretionary });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};

export const subscriptionPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const userProfile = await getUserProfile(userId);
    res.status(200).send({
      userProfile,
    });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};

export const transactionsPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [formattedTransactions, unreadObj, userTour] = await Promise.all([
      getFormattedTransactions(userId),
      getUnreadTransactionCount(userId),
      getUserTour(userId),
    ]);
    res.status(200).send({ formattedTransactions, userTour, unreadObj });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
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
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};

export const userPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [linkToken, userProfile, stripeSubscription, googleSubscription] =
      await Promise.all([
        createLinkToken(userId),
        getUserProfile(userId),
        getStripeSubscription(userId),
        getGoogleSubscriptionStatus(userId),
      ]);
    res
      .status(200)
      .send({ linkToken, userProfile, stripeSubscription, googleSubscription });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};

export const reviewPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [formattedTransactions, pinnedUserGoal] = await Promise.all([
      getFormattedTransactions(userId, false),
      getPinnedUserGoal(userId),
    ]);
    res.status(200).send({ formattedTransactions, pinnedUserGoal });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
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
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};

export const goalTransferPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const goalTransactionId = req.body.goalTransactionId;

    const [goals, goalTransfer] = await Promise.all([
      db.goal.findMany({
        where: {
          userId,
        },
      }),
      db.goalTransfer.findUnique({
        where: {
          userId,
          id: goalTransactionId,
        },
      }),
    ]);
    res.status(200).send({ goals, goalTransfer });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};

export const editGoalPage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const goalId = req.body.goalId;

    const goal = await db.goal.findUnique({
      where: {
        userId,
        id: goalId,
      },
    });
    let initialAmount: number | undefined = undefined;
    if (goal?.initialTransferId)
      initialAmount = (
        await db.goalTransfer.findFirst({
          where: { id: goal.initialTransferId },
        })
      )?.amount.toNumber();
    res.status(200).send({ goal, initialAmount });
  } catch (err) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting data for the page' });
  }
};
