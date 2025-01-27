import { androidpublisher_v3, google } from 'googleapis';
import db from './db';

let playDeveloperApi: androidpublisher_v3.Androidpublisher;
const packageName = process.env.PLAY_PACKAGE_NAME;
const subscriptionId = process.env.PLAY_SUBSCRIPTION_ID;
const private_key = process.env.CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n');
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.CLOUD_PROJECT_ID,
    private_key_id: process.env.CLOUD_PRIVATE_KEY_ID,
    private_key,
    client_email: process.env.CLOUD_CLIENT_EMAIL,
    client_id: process.env.CLOUD_CLIENT_ID,
    // @ts-ignore
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.CLOUD_CLIENT_X509_CERT_URL,
    universe_domain: 'googleapis.com',
  },
  scopes: ['https://www.googleapis.com/auth/androidpublisher'],
});

async function getPlayDeveloperApi() {
  if (!playDeveloperApi) {
    const authClient = await auth.getClient();
    playDeveloperApi = google.androidpublisher({
      version: 'v3',
      //@ts-ignore
      auth: authClient,
    });
  }

  return playDeveloperApi;
}

export async function getSubscriptionStatus(
  subscription: androidpublisher_v3.Schema$SubscriptionPurchase
) {
  if (!subscription.expiryTimeMillis)
    throw Error('Invalid subscription data: expiryTimeMillis is missing');
  const currentTimeMillis = Date.now();
  const expiryTimeMillis = parseInt(subscription.expiryTimeMillis, 10);

  if (isNaN(expiryTimeMillis)) throw Error('Invalid expiryTimeMillis value');

  const paymentState =
    subscription.paymentState !== undefined ? subscription.paymentState : -1;
  const cancelReason = subscription.cancelReason;

  let isActive = false;
  let subscriptionStatus = 'UNKNOWN';

  if (expiryTimeMillis > currentTimeMillis) {
    if (paymentState === 1) {
      isActive = true;
      subscriptionStatus = 'ACTIVE';
    } else if (paymentState === 0) {
      isActive = false;
      subscriptionStatus = 'PAYMENT_PENDING';
    } else if (paymentState === 2) {
      isActive = true;
      subscriptionStatus = 'ACTIVE_FREE_TRIAL';
    } else {
      isActive = false;
      subscriptionStatus = 'UNKNOWN_PAYMENT_STATE';
    }
  } else {
    isActive = false;
    subscriptionStatus = 'EXPIRED';
  }

  if (cancelReason !== undefined && cancelReason !== null) {
    switch (cancelReason) {
      case 0:
        subscriptionStatus = 'CANCELED_BY_USER';
        break;
      case 1:
        subscriptionStatus = 'CANCELED_BY_SYSTEM';
        break;
      case 2:
        subscriptionStatus = 'REPLACED';
        break;
      case 3:
        subscriptionStatus = 'CANCELED_BY_DEVELOPER';
        break;
      default:
        subscriptionStatus = 'CANCELED';
    }
    isActive = false;
  }

  return {
    ...subscription,
    subscriptionStatus,
    isActive,
    expiryTimeMillis,
    paymentState,
    cancelReason,
  };
}

export async function cancelSubscription(purchaseToken: string) {
  try {
    const playDeveloperApi = await getPlayDeveloperApi();
    await playDeveloperApi.purchases.subscriptions.cancel({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });

    console.log('Subscription canceled successfully');
  } catch (err: any) {
    console.error('Failed to cancel subscription:', err.message);
  }
}

export async function getGoogleSubscriptionStatus(userId: string) {
  try {
    const userProfile = await db.userProfile.findUnique({
      where: { userId },
    });
    if (!userProfile) throw Error('User not found');
    if (!userProfile.googlePaySubscriptionToken) {
      console.log('Subscription token not found');
      return null;
    }
    const purchaseToken = userProfile.googlePaySubscriptionToken;
    const playDeveloperApi = await getPlayDeveloperApi();
    const response = await playDeveloperApi.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });

    return await getSubscriptionStatus(response.data);
  } catch (err: any) {
    console.error('Failed to get subscription status:', err.message);
  }
}

export async function getVoidedPurchases(
  startTimeMillis: number,
  endTimeMillis: number
) {
  const playDeveloperApi = await getPlayDeveloperApi();
  const voidedPurchasesResponse =
    await playDeveloperApi.purchases.voidedpurchases.list({
      packageName,
      startTime: startTimeMillis.toString(),
      endTime: endTimeMillis.toString(),
    });

  return voidedPurchasesResponse.data.voidedPurchases || [];
}

export async function isSubscriptionExpired(subscriptionToken: string) {
  const subscriptionStatus = await getGoogleSubscriptionStatusByToken(
    subscriptionToken
  );
  // check if expiry time is in the future
  return !isSubscriptionStatusExpired(subscriptionStatus);
}

export async function isSubscriptionStatusExpired(
  subscriptionStatus?: androidpublisher_v3.Schema$SubscriptionPurchase
) {
  if (!subscriptionStatus || !subscriptionStatus.expiryTimeMillis) {
    console.log('Subscription status or expiry time is not available.');
    return true;
  }

  const expiryDate = new Date(parseInt(subscriptionStatus.expiryTimeMillis));
  const currentDate = new Date();
  if (expiryDate < currentDate) return true;
  return false;
}

export async function getGoogleSubscriptionStatusByToken(
  purchaseToken: string
) {
  try {
    const playDeveloperApi = await getPlayDeveloperApi();
    const response = await playDeveloperApi.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });

    return response.data;
  } catch (err: any) {
    console.error('Failed to get subscription status:', err.message);
  }
}

export async function getSubscriptionPriceById() {
  try {
    const playDeveloperApi = await getPlayDeveloperApi();

    // Fetch subscription details (SKU) using In-App Products API
    const product = await playDeveloperApi.inappproducts.get({
      packageName,
      sku: subscriptionId, // Subscription ID corresponds to the SKU
    });

    const productDetails = product.data;
    if (productDetails && productDetails.prices) {
      // Assuming we want the price in the first available currency
      const priceInfo =
        productDetails.prices[Object.keys(productDetails.prices)[0]];
      const priceAmountMicros = priceInfo.priceMicros;
      const priceCurrencyCode = priceInfo.currency;

      // @ts-ignore
      const price = priceAmountMicros / 1e6; // Convert micros to standard currency
      console.log(`Subscription price: ${price} ${priceCurrencyCode}`);
      return { price, currency: priceCurrencyCode };
    } else {
      console.log('Price not available for this subscription.');
      return null;
    }
  } catch (err: any) {
    console.error('Failed to get subscription price:', err.message);
    throw err;
  }
}
