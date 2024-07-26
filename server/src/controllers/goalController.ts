import { Request, Response } from 'express';

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    console.log('req', req);
    // const goalId = req.body.id;
    // const goal = await deleteGoalWithId(goalId);
    res.status(200).send({});
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};
