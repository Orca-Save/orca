import { Request, Response } from 'express';

import {
  onboardUser as onboard,
  saveOnboardingProfile as saveProfile,
} from '../utils/onboarding';

export const saveOnboardingProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const onboardingProfile = req.body.onboardingProfile;
    const [items] = await Promise.all([saveProfile(userId, onboardingProfile)]);
    res.status(200).send({ items });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting linked items' });
  }
};

export const onboardUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const onboardingProfile = req.body.onboardingProfile;
    const [items] = await Promise.all([onboard(userId, onboardingProfile)]);
    res.status(200).send({ items });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting linked items' });
  }
};
