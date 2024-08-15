import { Request, Response } from 'express';

import { User } from '../types/user';
import { appInsightsClient } from '../utils/appInsights';
import db from '../utils/db';
import {
  createLinkToken,
  exchangePublicToken,
  getAllLinkedItems,
  getRecurringTransactions,
  handleLoginExpiration,
  handleUserPermissionRevoked,
  markAllTransactionsAsRead,
  markTransactionAsRead,
  markTransactionAsUnread,
  refreshUserItems,
  removePlaidItem,
  syncItems,
  syncTransactions,
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

export const markAllTransactionsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    await markAllTransactionsAsRead(userId, false);
    res.status(200).send({ message: 'Transactions marked as read' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error marking transactions as read' });
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
    res.status(500).send({ message: 'Error removing item' });
  }
};

export const readTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    await markTransactionAsRead(
      userId,
      req.body.transactionId,
      req.body.impulse,
      req.body.impulseRating
    );
    res.status(200).send({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error marking transaction as read' });
  }
};

export const unreadTransaction = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.oid;
    await markTransactionAsUnread(userId, req.body.transactionId);
    res.status(200).send({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error marking transaction as unread' });
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

export const syncUserItems = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as User;
    const success = await syncItems(user.oid);

    res.status(200).send({ success });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting linked items' });
  }
};

export const webhook = async (req: Request, res: Response) => {
  try {
    appInsightsClient.trackEvent({
      name: 'PlaidWebhookReceived',
      properties: req.body,
    });
    const {
      error,
      item_id,
      environment,
      webhook_code,
      webhook_type,
      historical_update_complete,
      initial_update_complete,
    } = req.body;
    await db.plaidWebhook.create({
      data: {
        itemId: item_id,
        type: webhook_type,
        code: webhook_code,
        historical: historical_update_complete,
        initial: initial_update_complete,
        error,
        environment: environment,
        json: req.body,
      },
    });
    const plaidItem = await db.plaidItem.findFirst({
      where: { itemId: item_id },
    });

    if (!plaidItem) {
      throw new Error('Plaid item not found');
    }

    switch (webhook_code) {
      case 'INITIAL_UPDATE':
      case 'SYNC_UPDATES_AVAILABLE':
        await syncTransactions(plaidItem);
        appInsightsClient.trackEvent({
          name: 'SyncTransactions',
          properties: { item_id, result: 'success' },
        });
        break;
      case 'HISTORICAL_UPDATE':
      case 'RECURRING_TRANSACTIONS_UPDATE':
        await getRecurringTransactions(plaidItem.userId);
        appInsightsClient.trackEvent({
          name: 'GetRecurringTransactions',
          properties: { item_id, userId: plaidItem.userId, result: 'success' },
        });
        break;
      case 'LOGIN_REPAIRED':
        await handleLoginExpiration(plaidItem, false);
        appInsightsClient.trackEvent({
          name: 'HandleLoginExpiration',
          properties: { item_id, repaired: true, result: 'success' },
        });
        break;
      case 'PENDING_EXPIRATION':
        await handleLoginExpiration(plaidItem, true);
        appInsightsClient.trackEvent({
          name: 'HandleLoginExpiration',
          properties: { item_id, repaired: false, result: 'success' },
        });
        break;
      case 'USER_PERMISSION_REVOKED':
        await handleUserPermissionRevoked(plaidItem);
        appInsightsClient.trackEvent({
          name: 'HandleUserPermissionRevoked',
          properties: { item_id, result: 'success' },
        });
        break;
      case 'ERROR':
        if (error.error_code === 'ITEM_LOGIN_REQUIRED')
          handleLoginExpiration(plaidItem, true);
        appInsightsClient.trackEvent({
          name: 'PlaidWebhookError',
          properties: {
            item_id,
            webhook_code,
            webhook_type,
            error_code: error.error_code,
          },
        });
        break;
      default:
        console.log(`Unhandled webhook code: ${webhook_code}`);
        appInsightsClient.trackEvent({
          name: 'UnhandledWebhookCode',
          properties: { item_id, webhook_code },
        });
    }

    res.status(200).send({ message: 'Webhook received' });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error getting linked items' });
  }
};
