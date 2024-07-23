import { Request, Response } from 'express';
import db from '../utils/db';

export const getOnboardingProfileCount = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params.userId;
    await db.onboardingProfile.count({
      where: {
        userId: userId,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};
