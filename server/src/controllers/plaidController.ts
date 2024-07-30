import { Request, Response } from 'express';

import {
  createLinkToken,
  exchangePublicToken,
  getAllLinkedItems,
} from '../utils/plaid';

export const linkedItems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [items] = await Promise.all([getAllLinkedItems(userId)]);
    res.status(200).send({ items });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting linked items' });
  }
};

export const linkToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const [linkToken] = await Promise.all([createLinkToken(userId)]);
    res.status(200).send({ linkToken });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error creating link token' });
  }
};

export const exchangeToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const { publicToken, metadata } = req.body;
    const results = await Promise.all([
      exchangePublicToken(
        publicToken,
        metadata,
        userId,
        req.body.overrideExistingCheck
      ),
    ]);
    res.status(200).send(results);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error creating link token' });
  }
};
