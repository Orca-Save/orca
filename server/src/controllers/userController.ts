import { Request, Response } from 'express';

import { User } from '../types/user';
import { appInsightsClient } from '../utils/appInsights';
import {
  onboardUser as onboard,
  saveOnboardingProfile as saveProfile,
} from '../utils/onboarding';
import { clearUserData } from '../utils/userActions';
import {
  cancelGoogleSubscription,
  setGoalPinned,
  setGoalTransferPinned,
  setGooglePaySubscriptionToken,
  updateTour,
} from '../utils/users';

export const saveOnboardingProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const onboardingProfile = req.body.onboardingProfile;
    const [items] = await Promise.all([saveProfile(userId, onboardingProfile)]);
    res.status(200).send({ items });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error saving onboarding profile' });
  }
};

export const onboardUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const onboardingProfile = req.body.onboardingProfile;
    const skipSync = req.body.skipSync;
    const [items] = await Promise.all([
      onboard(userId, onboardingProfile, skipSync),
    ]);
    res.status(200).send({ items });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error onboarding user' });
  }
};

export const updateUserTour = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const tour = req.body.tour;
    appInsightsClient.trackEvent({
      name: 'UpdateUserTour',
      properties: { userId, ...tour },
    });
    const updatedTour = await updateTour(userId, tour);
    res.status(200).send({ updatedTour });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error updating user tour' });
  }
};

export const goalPinned = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { typeId, pinned } = req.body;

    const goalTransfer = await setGoalPinned(user.oid, typeId, pinned);
    res.status(200).send({ goalTransfer });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const setGoogleSubscriptionToken = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.oid;
    const token = req.body.token;
    const success = await setGooglePaySubscriptionToken(userId, token);
    res.status(200).send({ success });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res
      .status(500)
      .send({ message: 'Error setting Google Pay subscription token' });
  }
};

export const cancelGoogleSub = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const success = await cancelGoogleSubscription(userId);
    res.status(200).send({ success });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res
      .status(500)
      .send({ message: 'Error setting Google Pay subscription token' });
  }
};

export const goalTransferPinned = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { typeId, pinned } = req.body;

    const goalTransfer = await setGoalTransferPinned(user.oid, typeId, pinned);
    res.status(200).send({ goalTransfer });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error getting onboarding profile count' });
  }
};

export const clearAllUserData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const success = await clearUserData(userId);
    res.status(200).send({ success });
  } catch (err: any) {
    appInsightsClient.trackException({ exception: err });
    res.status(500).send({ message: 'Error refreshing items' });
  }
};
