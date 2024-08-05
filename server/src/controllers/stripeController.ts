import { Request, Response } from 'express';

import { User } from '../types/user';
import { createSubscription, getPrice } from '../utils/stripe';

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
    console.log(user);
    const price = await createSubscription(user.oid, user.emails[0]);
    res.status(200).send({ price });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting price' });
  }
};
