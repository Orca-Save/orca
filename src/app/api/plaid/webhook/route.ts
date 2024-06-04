import {
  getRecurringTransactions,
  syncTransactions,
} from '@/app/_actions/plaid';
import { client } from '@/appInsights';
import db from '@/db/db';
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
      default:
        console.log(`Unhandled webhook code: ${webhook_code}`);
    }

    return NextResponse.json({ message: 'success' });
  } catch (e) {
    client.trackException({ exception: e });
    return NextResponse.json({ message: 'error' });
  }
}

export { plaidWebhookHandler as POST };
