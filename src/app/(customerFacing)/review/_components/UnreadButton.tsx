'use client';

import {
  getRecurringTransactions,
  markAllTransactionsAsRead,
} from '@/app/_actions/plaid';
import { Button } from 'antd';

export default function UnreadButton({ userId }: { userId: string }) {
  return (
    <>
      <Button
        data-id='mark-all-unread'
        onClick={() => markAllTransactionsAsRead(userId, false)}
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
