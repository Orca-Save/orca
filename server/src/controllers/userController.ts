import { Request, Response } from 'express';

import { User } from '../types/user';
import {
  onboardUser as onboard,
  saveOnboardingProfile as saveProfile,
} from '../utils/onboarding';
import { setGoalPinned, setGoalTransferPinned } from '../utils/users';

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

export const goalPinned = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { typeId, pinned } = req.body;

    const goalTransfer = await setGoalPinned(user.oid, typeId, pinned);
    res.status(200).send({ goalTransfer });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const goalTransferPinned = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { typeId, pinned } = req.body;

    const goalTransfer = await setGoalTransferPinned(user.oid, typeId, pinned);
    res.status(200).send({ goalTransfer });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};
