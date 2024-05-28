'use client';

import { markAllTransactionsAsUnread } from '@/app/_actions/plaid';
import { Button } from 'antd';

export default function UnreadButton({ userId }: { userId: string }) {
  return (
    <Button onClick={() => markAllTransactionsAsUnread(userId)}>
      Mark all unread
    </Button>
  );
}
