import { Capacitor } from '@capacitor/core';

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';

import useFetch from '../../hooks/useFetch';
import { GooglePay } from '../../plugins/googlePay';
import { apiFetch } from '../../utils/general';
if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  console.error('Stripe is not setup properly!');
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutForm({
  setSubscriptionId,
}: {
  setSubscriptionId?: (id: string) => void;
}) {
  const { data } = useFetch('api/stripe/createCheckout', 'GET');

  // check capacitor getPlatform
  const platform = Capacitor.getPlatform();
  if (platform !== 'web') {
    GooglePay.isReadyToPay().then((val: any) => {
      if (val?.result === true) {
        console.log('Google Pay is ready to pay');
        GooglePay.requestPayment({
          totalPrice: '4.00',
          currencyCode: 'USD',
        }).then((val) => console.log('Google Pay payment result', val));
      }
    });

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
          console.log('onComplete');
          const results = await apiFetch(
            '/api/stripe/completeCheckout',
            'POST',
            {
              sessionId: data.sessionId,
            }
          );
          console.log('results', results);
          setSubscriptionId?.(results.stripeSubscriptionId);
        },
      }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
