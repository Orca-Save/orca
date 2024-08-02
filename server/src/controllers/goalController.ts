import { Request, Response } from 'express';

import { User } from '../types/user';
import db from '../utils/db';
import { listGoals } from '../utils/goals';
import {
  addGoalTransfer,
  addQuickGoalTransfer,
  addQuickSave,
  updateGoalTransfer,
} from '../utils/goalTransfers';

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    // const goalId = req.body.id;
    // const goal = await deleteGoalWithId(goalId);
    res.status(200).send({});
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const listGoal = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const goals = await listGoals(user.oid);
    res.status(200).send({ goals });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const quickSave = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { goalId, transfer } = req.body;

    const goalTransfer = await addQuickSave(user.oid, goalId, transfer);
    res.status(200).send({ goalTransfer });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
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
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
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
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const updateTransfer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { formData } = req.body;

    const goalTransfer = await updateGoalTransfer(user.oid, formData);
    res.status(200).send({ goalTransfer });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const addTransfer = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { formData, isTemplate } = req.body;

    const goalTransfer = await addGoalTransfer(user.oid, isTemplate, formData);
    res.status(200).send({ goalTransfer });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};
