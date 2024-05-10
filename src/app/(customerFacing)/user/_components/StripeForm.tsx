'use client';

import { Elements } from '@stripe/react-stripe-js';

import { loadStripe } from '@stripe/stripe-js';
import SubscriptionForm from './SubscriptionForm';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  console.error('Stripe is not setup properly!');
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function StripeForm({
  userId,
  email,
}: {
  email: string;
  userId: string;
}) {
  return (
    <>
      <Elements
        stripe={stripePromise}
        options={{
          mode: 'payment',
          amount: 300,
          currency: 'usd',
          setupFutureUsage: 'on_session',
        }}>
        <SubscriptionForm userId={userId} email={email} />
      </Elements>
    </>
  );
}
