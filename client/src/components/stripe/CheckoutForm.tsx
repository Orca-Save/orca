import { Capacitor } from '@capacitor/core';

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import { apiFetch } from '../../utils/general';
// @ts-ignore
if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  console.error('Stripe is not setup properly!');
// @ts-ignore
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutForm({
  setSubscriptionId,
}: {
  setSubscriptionId?: (id: string) => void;
}) {
  const { data } = useFetch('api/stripe/createCheckout', 'GET');
  const platform = Capacitor.getPlatform();
  if (platform !== 'web') {
    return null;
  }

  if (!data) return null;

  const options = {
    clientSecret: data.client_secret,
  };
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{
        ...options,
        onComplete: async () => {
          const results = await apiFetch(
            '/api/stripe/completeCheckout',
            'POST',
            {
              sessionId: data.sessionId,
            }
          );
          setSubscriptionId?.(results.stripeSubscriptionId);
        },
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
