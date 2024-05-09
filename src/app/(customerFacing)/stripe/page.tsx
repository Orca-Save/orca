'use client';

import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './_components/CheckoutForm';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  console.error('Stripe is not setup properly!');
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

async function StripePage() {
  return (
    <div>
      <Elements
        stripe={stripePromise}
        options={{
          mode: 'payment',
          amount: 300,
          currency: 'usd',
          setupFutureUsage: 'on_session',
        }}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

export default StripePage;
