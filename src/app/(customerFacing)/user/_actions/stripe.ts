'use server';
import db from '@/db/db';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY)
  console.error('MISSING STRIPE_SECRET_KEY!!!');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type SubscriptionRequest = {
  name: string;
  email: string;
  paymentMethod: string;
};
export async function createSubscription(userId: string, email: string) {
  const userProfile = await db.userProfile.findFirst({
    where: {
      userId,
    },
  });

  let customerId = userProfile?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
    });
    customerId = customer.id;
  }

  const priceId = process.env.STRIPE_PRODUCT_SUBSCRIPTION_ID;

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId,
      },
    ],
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
      payment_method_types: ['card'],
    },
    expand: ['latest_invoice.payment_intent'],
  });

  if (!userProfile) {
    await db.userProfile.create({
      data: {
        userId,
        stripeCustomerId: customerId,
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
  }
}

export async function addSubscriptionId(
  userId: string,
  subscriptionId: string
) {
  await db.userProfile.update({
    data: {
      stripeSubscriptionId: subscriptionId,
      updatedAt: new Date(),
    },
    where: {
      userId,
    },
  });
  revalidatePath('/user');
}

export async function updateSubscription(
  userId: string,
  cancel_at_period_end: boolean
) {
  const userProfile = await db.userProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!userProfile?.stripeSubscriptionId)
    return { success: false, message: 'Could not complete the cancellation.' };

  const sub = await stripe.subscriptions.update(
    userProfile.stripeSubscriptionId,
    {
      cancel_at_period_end,
    }
  );
  revalidatePath('/user');
  return {
    message: 'Cancel success!',
  };
}

export async function getSubscription(userId: string) {
  const userProfile = await db.userProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!userProfile?.stripeSubscriptionId) return null;

  const subscription = await stripe.subscriptions.retrieve(
    userProfile.stripeSubscriptionId
  );

  return subscription;
}
