import { Request, Response } from 'express';

import { User } from '../types/user';
import {
  addSubscriptionId,
  completeCheckoutSession,
  createCheckoutSession,
  createPaymentIntent,
  createSubscription,
  getPrice,
  stripeWebhook,
  updateSubscription,
} from '../utils/stripe';

export const productPrice = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const price = await getPrice();
    res.status(200).send({ price });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error getting price' });
  }
};

export const createSub = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const data = await createSubscription(user.oid, user.emails[0]);
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error getting price' });
  }
};

export const completeCheckout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const sessionId: string = req.body.sessionId;
    const data = await completeCheckoutSession(user.oid, sessionId);
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error getting price' });
  }
};

export const paymentIntent = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const data = await createPaymentIntent(user.oid, user.emails[0]);
    res.status(200).send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error getting price' });
  }
};

export const createCheckout = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const result = await createCheckoutSession(user.emails[0]);
    res.status(200).send(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).send({ message: err.message });
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  try {
    await stripeWebhook(req.body, signature);
    res.status(200).send({ message: 'Webhook handled successfully' });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(400).send({ message: `Webhook Error: ${err.message}` });
  }
};

export const updateSub = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const cancel = req.body.cancel;
    const message = await updateSubscription(user.oid, cancel);
    res.status(200).send({ message });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).send({ message: 'Error updating subscription' });
  }
};
