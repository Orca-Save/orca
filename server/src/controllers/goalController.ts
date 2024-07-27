import { Request, Response } from 'express';
import { User } from '../types/user';
import { listGoals } from '../utils/goals';

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
