import { Request, Response } from 'express';

import { User } from '../types/user';
import {
  createLinkToken,
  exchangePublicToken,
  getAllLinkedItems,
  refreshUserItems,
  removePlaidItem,
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

export const refreshItems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    await Promise.all([refreshUserItems(userId)]);
    res.status(200).send({ message: 'Items refreshed' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error refreshing items' });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    const itemId = req.body.itemId;
    const success = await removePlaidItem(userId, itemId);
    res.status(200).send({ success });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error refreshing items' });
  }
};

export const listAllLinkedItems = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const itemsData = await getAllLinkedItems(user.oid);

    res.status(200).send({ itemsData });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting linked items' });
  }
};
