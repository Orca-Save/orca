import {
  getRecurringTransactions,
  handleLoginExpiration,
  handleUserPermissionRevoked,
  syncTransactions,
} from '@/app/_actions/plaid';
import { appInsightsClient } from '@/lib/appInsights';
import { NextResponse } from 'next/server';
import db from '../../../../../../server/src/db/db';

async function plaidWebhookHandler(req: any) {
  const reqObj = await req.json();
  try {
    appInsightsClient.trackEvent({
      name: 'PlaidWebhookReceived',
      properties: { ...reqObj },
    });
    const {
      item_id,
      webhook_code,
      webhook_type,
      historical_update_complete,
      initial_update_complete,
      environment,
      error,
    } = reqObj;
    await db.plaidWebhook.create({
      data: {
        itemId: item_id,
        type: webhook_type,
        code: webhook_code,
        historical: historical_update_complete,
        initial: initial_update_complete,
        error,
        environment: environment,
        json: reqObj,
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

    return NextResponse.json({ message: 'success' });
  } catch (e: any) {
    appInsightsClient.trackException({ exception: e });

    return NextResponse.json({ message: 'error' });
  }
}

export { plaidWebhookHandler as POST };
