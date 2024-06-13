import {
  getRecurringTransactions,
  handleLoginExpiration,
  handleUserPermissionRevoked,
  syncTransactions,
} from '@/app/_actions/plaid';
import db from '@/db/db';
import { appInsightsClient } from '@/lib/appInsights';
import { NextResponse } from 'next/server';

async function plaidWebhookHandler(req: any) {
  try {
    const { item_id, webhook_code } = await req.json();
    const plaidItem = await db.plaidItem.findFirst({
      where: { itemId: item_id },
    });

    if (!plaidItem) {
      throw new Error('Plaid item not found');
    }

    appInsightsClient.trackEvent({
      name: 'PlaidWebhookReceived',
      properties: { item_id, webhook_code },
    });

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
    appInsightsClient.trackEvent({
      name: 'PlaidWebhookError',
      properties: { error: e.message, item_id: req?.body?.item_id },
    });
    return NextResponse.json({ message: 'error' });
  }
}

export { plaidWebhookHandler as POST };
