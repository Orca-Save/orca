import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Skeleton, Spin } from 'antd';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import SubscriptionForm from './SubscriptionForm';
if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  console.error('Stripe is not setup properly!');
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

export default function StripeForm({
  userId,
  email,
  redirect,
}: {
  email: string;
  userId: string;
  redirect: boolean;
}) {
  const { data } = useFetch('api/stripe/createSubscription', 'GET');
  if (!data) return null;
  const { clientSecret, subscriptionId } = data;
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
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
        }}
      >
        <SubscriptionForm
          clientSecret={clientSecret}
          redirect={redirect}
          subscriptionId={subscriptionId}
        />
      </Elements>
    </div>
  );
}
