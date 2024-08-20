import Stripe from 'stripe';

import db from './db/db';

if (!process.env.STRIPE_SECRET_KEY)
  console.error('MISSING STRIPE_SECRET_KEY!!!');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession(
  userId: string,
  sessionId: string,
  email: string,
  redirectUrl: string
) {
  if (sessionId) {
    const sessionDetails = await stripe.checkout.sessions.retrieve(sessionId);

    if (sessionDetails.subscription && sessionDetails.customer) {
      const stripeSubscriptionId = sessionDetails.subscription as string;
      const stripeCustomerId = sessionDetails.customer as string;
      await db.userProfile.update({
        data: {
          stripeSubscriptionId,
          stripeCustomerId,
          updatedAt: new Date(),
        },
        where: {
          userId,
        },
      });
    }
    return { success: true };
  } else {
    const results = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      ui_mode: 'embedded',
      subscription_data: {
        trial_period_days: 7,
      },
      line_items: [
        {
          price: process.env.STRIPE_PRICE_SUBSCRIPTION_ID,
          quantity: 1,
        },
      ],
      success_url: redirectUrl + '?session_id={CHECKOUT_SESSION_ID}',
    });
    return results.url;
  }
}

export async function createSubscription(
  userId: string,
  email: string
): Promise<
  | {
      clientSecret?: string;
      subscriptionId?: string;
    }
  | { message: string }
> {
  const userProfile = await db.userProfile.findFirst({
    where: {
      userId,
    },
  });

  if (userProfile === null)
    return {
      message: 'user not found',
    };
  let customerId = userProfile?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
    });
    customerId = customer.id;
  }

  const priceId = process.env.STRIPE_PRICE_SUBSCRIPTION_ID;

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: priceId,
      },
    ],
    // trial_period_days: 7,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
      payment_method_types: ['card'],
    },
    expand: ['latest_invoice.payment_intent'],
  });

  await db.userProfile.upsert({
    where: {
      userId,
    },
    create: {
      userId,
      stripeCustomerId: customerId,
    },
    update: {
      stripeCustomerId: customerId,
      updatedAt: new Date(),
    },
  });

  // @ts-ignore
  if (subscription.latest_invoice?.payment_intent?.client_secret) {
    return {
      // @ts-ignore
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    };
  }

  return {
    message: 'Failed to create subscription',
  };
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

export async function getPrice() {
  if (!process.env.STRIPE_PRICE_SUBSCRIPTION_ID) {
    console.error('MISSING STRIPE_PRODUCT_ID!');
    return;
  }
  const price = await stripe.prices.retrieve(
    process.env.STRIPE_PRICE_SUBSCRIPTION_ID
  );
  return price;
}
