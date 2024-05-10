'use client';

import { Button } from 'antd';
import { updateSubscription } from '../_actions/stripe';
import { useRouter } from 'next/navigation';

export default function UpdateSubscriptionForm({
  userId,
  cancel,
  actionText,
}: {
  userId: string;
  actionText: string;
  cancel: boolean;
}) {
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        updateSubscription(userId, cancel);
        router.push('/user');
      }}>
      {actionText}
    </Button>
  );
}
