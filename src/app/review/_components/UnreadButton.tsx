'use client';

import {
  getRecurringTransactions,
  markAllTransactionsAsUnread,
} from '@/app/_actions/plaid';
import { Button } from 'antd';

export default function UnreadButton({ userId }: { userId: string }) {
  return (
    <>
      <Button
        data-id='mark-all-unread'
        onClick={() => markAllTransactionsAsUnread(userId)}
      >
        Mark all unread
      </Button>
      <Button
        data-id='get-recurring-transactions'
        onClick={() => getRecurringTransactions(userId)}
      >
        Get recurring
      </Button>
    </>
  );
}
