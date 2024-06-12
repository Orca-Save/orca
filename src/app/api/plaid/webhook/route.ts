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

    switch (webhook_code) {
      case 'INITIAL_UPDATE':
      case 'SYNC_UPDATES_AVAILABLE':
        await syncTransactions(plaidItem);
        break;
      case 'HISTORICAL_UPDATE':
      case 'RECURRING_TRANSACTIONS_UPDATE':
        await getRecurringTransactions(plaidItem.userId);
        break;
      case 'LOGIN_REPAIRED':
        await handleLoginExpiration(plaidItem, false);
        break;
      case 'PENDING_EXPIRATION':
        await handleLoginExpiration(plaidItem, true);
        break;
      case 'USER_PERMISSION_REVOKED':
        await handleUserPermissionRevoked(plaidItem);
        break;
      default:
        console.log(`Unhandled webhook code: ${webhook_code}`);
    }

    return NextResponse.json({ message: 'success' });
  } catch (e) {
    appInsightsClient.trackException({ exception: e });
    return NextResponse.json({ message: 'error' });
  }
}

export { plaidWebhookHandler as POST };
