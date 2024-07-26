'use client';

import { currencyFormatter } from '@/lib/utils';
import {
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import {
  StripeError,
  StripeExpressCheckoutElementConfirmEvent,
} from '@stripe/stripe-js';
import { Button, notification } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Stripe from 'stripe';
import { addSubscriptionId } from '../../../../../server/src/utils/_actions/stripe';

function useStripePrice() {
  const [price, setPrice] = useState<Stripe.Price | undefined>();

  useEffect(() => {
    fetch('/api/stripe/product', {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((data) => {
        setPrice(data);
      });
  }, []);

  return price;
}
function SubscriptionForm({
  clientSecret,
  userId,
  subscriptionId,
  redirect,
}: {
  redirect: boolean;
  clientSecret: string;
  userId: string;
  subscriptionId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();
  const price = useStripePrice();
  const onFinish = async () => {
    try {
      if (!stripe || !elements) return;

      const results = await elements.submit();
      const addResponse = await addSubscriptionId(userId, subscriptionId);
      if (results.error) {
        return;
      }
      const { error, paymentIntent } = await stripe.confirmPayment({
        clientSecret,
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/user`,
        },
        redirect: 'if_required',
      });

      if (paymentIntent === undefined) {
        console.error('failed to create payment method record');
        api.error({
          message: `Failed to create payment method record`,
          placement: 'top',
          duration: 2,
        });
        return;
      }
      if (error) {
        api.error({
          message: (error as StripeError).message,
          placement: 'top',
          duration: 3,
        });
      } else {
        api.success({
          message: 'Success! Check your email for the invoice.',
          placement: 'top',
          duration: 3,
        });
        if (redirect) router.push('/user');
      }
    } catch (error) {
      api.error({
        message: 'Something went wrong. Please try again later.',
        placement: 'top',
        duration: 3,
      });
      console.error(error);
    }
  };

  return (
    <>
      <ExpressCheckoutElement
        options={{
          buttonType: {
            // applePay: 'check-out',
            googlePay: 'subscribe',
            // paypal: 'buynow'
          },

          // wallets: {
          //   // applePay: 'always',
          //   googlePay: 'always',
          // },
        }}
        onConfirm={function (
          event: StripeExpressCheckoutElementConfirmEvent
        ) {}}
      />
      <PaymentElement
        options={{
          wallets: {
            applePay: 'auto',
            googlePay: 'auto',
          },
          fields: {
            billingDetails: {
              name: 'auto',
              email: 'auto',
            },
          },
        }}
      />
      {price?.unit_amount && (
        <Button
          type='primary'
          size='large'
          data-id='subscription-button'
          disabled={!stripe || !elements}
          onClick={onFinish}
        >
          Subscribe for {currencyFormatter(price.unit_amount / 100)}/
          {price.recurring?.interval}
        </Button>
      )}
    </>
  );
}

export default SubscriptionForm;