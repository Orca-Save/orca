'use server';
import db from '@/db/db';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY)
  console.error('MISSING STRIPE_SECRET_KEY!!!');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type SubscriptionRequest = {
  name: string;
  email: string;
  paymentMethod: string;
};
export async function createSubscription(
  userId: string,
  createSubscriptionRequest: SubscriptionRequest
) {
  const userProfile = await db.userProfile.findFirst({
    where: {
      userId,
    },
  });

  let customerId = userProfile?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: createSubscriptionRequest.name,
      email: createSubscriptionRequest.email,
      payment_method: createSubscriptionRequest.paymentMethod,
      invoice_settings: {
        default_payment_method: createSubscriptionRequest.paymentMethod,
      },
    });
    customerId = customer.id;
  }

  const priceId = process.env.STRIPE_PRODUCT_SUBSCRIPTION_ID;

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
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

  if (userProfile) {
    await db.userProfile.update({
      data: {
        stripeSubscriptionId: subscription.id,
        updatedAt: Date(),
      },
      where: {
        id: userProfile.id,
      },
    });
  } else {
    await db.userProfile.create({
      data: {
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

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
