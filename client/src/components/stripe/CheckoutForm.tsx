import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Skeleton, Spin } from 'antd';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

import useFetch from '../../hooks/useFetch';
if (!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  console.error('Stripe is not setup properly!');
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutForm({ redirect }: { redirect: string }) {
  const platform = Capacitor.getPlatform();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { data } = useFetch('api/stripe/createCheckout', 'POST', {
    sessionId,
    redirectUrl:
      platform === 'web'
        ? window.location.origin + '/' + redirect
        : 'orcamoney://' + redirect,
  });

  console.log('data', data);
  if (!data) return null;
  const { redirectUri } = data;

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
  if (sessionId) return <>Subscription successful!</>;
  else {
    console.log('redirecting');
    if (platform === 'web') window.location.href = redirectUri;
    else {
      console.log('opening browser');
      Browser.open({ url: redirectUri }).then(() => {
        const appUrlOpenListener = (data: any) => {
          console.log(data?.url);
          if (data.url && data.url.includes('onboarding')) {
            Browser.close();
          }
        };
        CapacitorApp.addListener('appUrlOpen', appUrlOpenListener);
      });
    }
  }
  if (!redirectUri)
    return (
      <div>
        <div className='flex justify-center'>
          <Spin />
        </div>
        <Skeleton paragraph={{ rows: 10 }} />
      </div>
    );
  return null;
}
