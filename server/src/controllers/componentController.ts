import { Request, Response } from 'express';
import { User } from '../types/user';
import { getGoalTransfersSum } from '../utils/goalTransfers';
import { completedUserGoalCount, getPinnedUserGoal } from '../utils/users';

export const goalCard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    let [goal, sums, completedCounts] = await Promise.all([
      getPinnedUserGoal(user.oid),
      getGoalTransfersSum(user.oid),
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
    res.status(200).send({ completedCounts, goal });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};
