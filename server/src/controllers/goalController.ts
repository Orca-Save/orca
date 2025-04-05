import { Request, Response } from 'express';

import { User } from '../types/user';
import { appInsightsClient } from '../utils/appInsights';
import db from '../utils/db';
import {
  addGoal,
  deleteGoalWithId,
  listGoals,
  updateGoal,
} from '../utils/goals';
import {
  addGoalTransfer,
  addQuickGoalTransfer,
  addQuickSave,
  getGoalTransfersSum,
  updateGoalTransfer,
} from '../utils/goalTransfers';

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const goalId = req.body.goalId;
    const goal = await deleteGoalWithId(user.oid, goalId);
    res.status(200).send({ goal });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};

export const listGoal = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const [goals, sums] = await Promise.all([
      listGoals(user.oid),
      getGoalTransfersSum(user.oid),
    ]);
    const goalSumMap = new Map(
      sums.map((item) => [
        item.goalId,
        { amount: item._sum.amount, count: item._count.goalId },
      ])
    );
    goals.forEach((goal) => {
      Object.assign(goal, {
        currentBalance: goalSumMap.get(goal.id)?.amount?.toNumber() || 0,
        savedItemCount: goalSumMap.get(goal.id)?.count || 0,
      });
    });
    res.status(200).send({ goals });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};

export const quickSave = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { goalId, transferId } = req.body;

    const goalTransfer = await addQuickSave(user.oid, goalId, transferId);
    res.status(200).send({ goalTransfer });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};

export const quickGoalTransfer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { goalTransferType, formData } = req.body;

    const goalTransfer = await addQuickGoalTransfer(
      user.oid,
      goalTransferType,
      formData
    );
    res.status(200).send({ goalTransfer });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};

export const deleteTransfer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { id } = req.body;

    const goalTransfer = await db.goalTransfer.delete({
      where: { id, userId: user.oid },
    });
    res.status(200).send({ goalTransfer });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};

export const updateTransfer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { formData } = req.body;

    const goalTransfer = await updateGoalTransfer(user.oid, formData);
    res.status(200).send({ goalTransfer });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};

export const addTransfer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { formData, isTemplate } = req.body;

    const goalTransfer = await addGoalTransfer(user.oid, isTemplate, formData);
    res.status(200).send({ goalTransfer });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { formData } = req.body;

    const goal = await addGoal(user.oid, formData);
    res.status(200).send({ goal });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};

export const updateGoalRecord = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { formData } = req.body;

    const goal = await updateGoal(user.oid, formData);
    res.status(200).send(goal);
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: err.message });
  }
};
