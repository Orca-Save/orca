import { message } from 'antd';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY)
  console.error('MISSING STRIPE_SECRET_KEY!!!');
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type SubscriptionRequest = {
  name: string;
  email: string;
  paymentMethod: string;
  priceId: string;
};
export async function createSubscription(
  createSubscriptionRequest: SubscriptionRequest
) {
  // create a stripe customer
  const customer = await stripe.customers.create({
    name: createSubscriptionRequest.name,
    email: createSubscriptionRequest.email,
    payment_method: createSubscriptionRequest.paymentMethod,
    invoice_settings: {
      default_payment_method: createSubscriptionRequest.paymentMethod,
    },
  });

  // get the price id from the front-end
  const priceId = createSubscriptionRequest.priceId;

  // create a stripe subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_settings: {
      payment_method_options: {
        card: {
          request_three_d_secure: 'any',
        },
      },
      payment_method_types: ['card'],
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });

  // @ts-ignore
  if (subscription.latest_invoice?.payment_intent?.client_secret) {
    return {
      // @ts-ignore
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    };
  } else {
    return {
      message: 'Something went wrong',
    };
  }
}
