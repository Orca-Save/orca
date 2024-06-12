'use client';

import { Elements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';

import { loadStripe } from '@stripe/stripe-js';
import { Skeleton, Spin } from 'antd';
import SubscriptionForm from './SubscriptionForm';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  console.error('Stripe is not setup properly!');
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function useSubscription(userId: string, email: string) {
  const [subscription, setSubscription] = useState<{
    clientSecret?: string;
    subscriptionId?: string;
  }>({});

  useEffect(() => {
    fetch('/api/stripe/createSubscription', {
      method: 'POST',
      body: JSON.stringify({ userId, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSubscription(data);
      });
  }, []);

  return subscription;
}

export default function StripeForm({
  userId,
  email,
  redirect,
}: {
  email: string;
  userId: string;
  redirect: boolean;
}) {
  const { clientSecret, subscriptionId } = useSubscription(userId, email);
  if (!clientSecret || !subscriptionId)
    return (
      <div>
        <div className='flex justify-center'>
          <Spin />
        </div>
        <Skeleton paragraph={{ rows: 10 }} />
      </div>
    );
  return (
    <div>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <SubscriptionForm
          clientSecret={clientSecret}
          redirect={redirect}
          userId={userId}
          subscriptionId={subscriptionId}
        />
      </Elements>
    </div>
  );
}
