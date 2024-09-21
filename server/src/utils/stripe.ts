import Stripe from 'stripe';

import db from './db/db';
import { createLinkToken, removePlaidItemsForUser } from './plaid';

if (!process.env.STRIPE_SECRET_KEY)
  console.error('MISSING STRIPE_SECRET_KEY!!!');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function completeCheckoutSession(
  userId: string,
  sessionId: string
) {
  const sessionDetails = await stripe.checkout.sessions.retrieve(sessionId);

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
  return { stripeSubscriptionId };
}

export async function createCheckoutSession(email: string) {
  const results = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    ui_mode: 'embedded',
    subscription_data: {
      trial_period_days: 7,
    },
    // payment_method_types: []
    redirect_on_completion: 'never',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_SUBSCRIPTION_ID,
        quantity: 1,
      },
    ],
  });
  return { client_secret: results.client_secret, sessionId: results.id };
}

export async function stripeWebhook(body: any, signature: string) {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    throw Error(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }
    case 'customer.subscription.paused': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionPaused(subscription);
      break;
    }
    case 'customer.subscription.resumed': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionResumed(subscription);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
    case 'invoice.payment_action_required': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentActionRequired(invoice);
      break;
    }
    case 'invoice.finalization_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleFinalizationFailed(invoice);
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}

async function handlePaymentActionRequired(invoice: Stripe.Invoice) {
  const subscription = invoice.subscription as string;

  const userProfile = await db.userProfile.findFirst({
    where: { stripeSubscriptionId: subscription },
  });

  if (userProfile) {
    await removePlaidItemsForUser(userProfile.userId);
    console.log(
      `Payment action required: Plaid items removed for user ${userProfile.userId}`
    );
  }
}

async function handleFinalizationFailed(invoice: Stripe.Invoice) {
  const subscription = invoice.subscription as string;

  const userProfile = await db.userProfile.findFirst({
    where: { stripeSubscriptionId: subscription },
  });

  if (userProfile) {
    await removePlaidItemsForUser(userProfile.userId);
    console.log(
      `Finalization failed: Plaid items removed for user ${userProfile.userId}`
    );
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userProfile = await db.userProfile.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (userProfile) {
    await removePlaidItemsForUser(userProfile.userId);
    console.log(
      `Subscription deleted: Plaid items removed for user ${userProfile.userId}`
    );
  }
}

async function handleSubscriptionPaused(subscription: Stripe.Subscription) {
  const userProfile = await db.userProfile.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (userProfile) {
    await removePlaidItemsForUser(userProfile.userId);
    console.log(
      `Subscription paused: Plaid items removed for user ${userProfile.userId}`
    );
  }
}

async function handleSubscriptionResumed(subscription: Stripe.Subscription) {
  const userProfile = await db.userProfile.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (userProfile) {
    await enablePlaidItemsForUser(userProfile.userId);
    console.log(
      `Subscription resumed: Plaid items enabled for user ${userProfile.userId}`
    );
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = invoice.subscription as string;

  const userProfile = await db.userProfile.findFirst({
    where: { stripeSubscriptionId: subscription },
  });

  if (userProfile) {
    await removePlaidItemsForUser(userProfile.userId);
    console.log(
      `Payment failed: Plaid items removed for user ${userProfile.userId}`
    );
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userProfile = await db.userProfile.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (userProfile) {
    console.log(`Subscription updated for user ${userProfile.userId}`);
  }
}

async function enablePlaidItemsForUser(userId: string) {
  const plaidItems = await db.plaidItem.findMany({
    where: { userId, deletedAt: { not: null } },
  });

  for (const item of plaidItems) {
    // Recreate Plaid items by either refreshing or re-linking as necessary
    const linkToken = await createLinkToken(userId);
    // Assuming a frontend flow where the user relinks their account using the new link token.
    // You'd need to handle this part in the frontend and exchange the token afterward.
  }

  await db.plaidItem.updateMany({
    where: { userId },
    data: {
      deletedAt: null,
      updatedAt: new Date(),
    },
  });

  console.log(`Plaid items re-enabled for user ${userId}`);
}

export async function createPaymentIntent(userId: string, email: string) {
  const price = await getPrice();
  if (!price?.unit_amount) throw Error('MISSING PRICE UNIT AMOUNT!');
  // get user profile and assign customer id to const variable
  let userProfile = await db.userProfile.findFirst({
    where: {
      userId,
    },
  });
  if (!userProfile?.stripeCustomerId) {
    // create customer and store it in userProfile
    const customer = await stripe.customers.create({
      email,
    });
    userProfile = await db.userProfile.update({
      data: {
        stripeCustomerId: customer.id,
        updatedAt: new Date(),
      },
      where: {
        userId,
      },
    });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: price?.unit_amount,
    currency: 'usd',
    customer: userProfile.stripeCustomerId!,
  });
  return { paymentIntent };
}

export async function isSubscriptionExpired(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const isCancelled =
    subscription.status === 'canceled' || subscription.status === 'unpaid';
  // Convert subscription current_period_end to milliseconds
  const isExpired = subscription.current_period_end * 1000 < Date.now();
  return isCancelled || isExpired;
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

export async function getStripeSubscription(userId: string) {
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
    throw Error('MISSING STRIPE_PRODUCT_ID!');
  }
  const price = await stripe.prices.retrieve(
    process.env.STRIPE_PRICE_SUBSCRIPTION_ID
  );
  return price;
}
