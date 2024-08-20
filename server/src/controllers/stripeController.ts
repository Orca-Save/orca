import { Request, Response } from 'express';

import { User } from '../types/user';
import {
  addSubscriptionId,
  createCheckoutSession,
  createSubscription,
  getPrice,
  updateSubscription,
} from '../utils/stripe';

export const productPrice = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const price = await getPrice();
    res.status(200).send({ price });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting price' });
  }
};

export const createSub = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const data = await createSubscription(user.oid, user.emails[0]);
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting price' });
  }
};

export const createCheckout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const { redirectUrl, sessionId } = req.body;
    const redirectUri = await createCheckoutSession(
      user.oid,
      sessionId,
      user.emails[0],
      redirectUrl
    );
    res.status(200).send({ redirectUri });
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

export const updateSub = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const cancel = req.body.cancel;
    const message = await updateSubscription(user.oid, cancel);
    res.status(200).send({ message });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error updating subscription' });
  }
};

export const addSubscription = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const subscriptionId = req.body.subscriptionId;
    const results = await addSubscriptionId(user.oid, subscriptionId);
    res.status(200).send({ results });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error updating subscription' });
  }
};
