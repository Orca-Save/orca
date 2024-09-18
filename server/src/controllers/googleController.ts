import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { appInsightsClient } from '../utils/appInsights';
import db from '../utils/db';
import {
  getGoogleSubscriptionStatusByToken,
  isSubscriptionExpired,
} from '../utils/googleCloud';
import { removePlaidItemsForUser } from '../utils/plaid';

const client = new OAuth2Client();

export async function webhookHandler(req: Request, res: Response) {
  try {
    appInsightsClient.trackEvent({
      name: 'GoogleWebhookReceived',
      properties: req.body,
    });
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).send('Unauthorized: No Authorization header');
      return;
    }

    const token = authHeader.split(' ')[1];

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 'backend',
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).send('Unauthorized: Invalid token payload');
      return;
    }

    const expectedIssuer = 'https://accounts.google.com';
    const expectedEmail = process.env.CLOUD_CLIENT_EMAIL;

    if (payload.iss !== expectedIssuer || payload.email !== expectedEmail) {
      res.status(401).send('Unauthorized: Invalid token issuer or email');
      return;
    }

    const pubsubMessage = req.body.message;
    const messageData = Buffer.from(pubsubMessage.data, 'base64').toString(
      'utf-8'
    );
    const messageJson = JSON.parse(messageData);
    const subscriptionNotification = messageJson.subscriptionNotification;

    appInsightsClient.trackEvent({
      name: 'GoogleWebhookVerified',
      properties: messageJson,
    });

    const purchaseToken = subscriptionNotification.purchaseToken;
    const notificationType = subscriptionNotification.notificationType;

    const subscription = await getGoogleSubscriptionStatusByToken(
      purchaseToken
    );

    const expired = await isSubscriptionExpired(purchaseToken);

    const userProfile = await db.userProfile.findFirst({
      where: { googlePaySubscriptionToken: purchaseToken },
    });

    if (!userProfile) {
      appInsightsClient.trackEvent({
        name: 'GoogleWebhookUserNotFound',
        properties: {
          purchaseToken,
          notificationType,
        },
      });
      console.log('User not found for the given purchase token');
    } else {
      // https://developer.android.com/google/play/billing/rtdn-reference#sub
      switch (notificationType) {
        case 1: // SUBSCRIPTION_RECOVERED
        case 2: // SUBSCRIPTION_RENEWED
        case 4: // SUBSCRIPTION_PURCHASED
        case 7: // SUBSCRIPTION_RESTARTED
          // Subscription is active
          if (subscription?.expiryTimeMillis)
            await db.userProfile.update({
              where: { userId: userProfile.userId },
              data: {
                subscriptionEnd: new Date(
                  parseInt(subscription.expiryTimeMillis)
                ),
              },
            });
          console.log(`Subscription activated for user ${userProfile.userId}`);
          break;
        case 3: // SUBSCRIPTION_CANCELED
        case 12: // SUBSCRIPTION_REVOKED
        case 10: // SUBSCRIPTION_PAUSED
        case 13: // SUBSCRIPTION_EXPIRED
          // Subscription is canceled or expired
          if (subscription?.expiryTimeMillis)
            await db.userProfile.update({
              where: { userId: userProfile.userId },
              data: {
                subscriptionEnd: new Date(
                  parseInt(subscription.expiryTimeMillis)
                ),
              },
            });
          await removePlaidItemsForUser(userProfile.userId);
          console.log(
            `Subscription canceled or expired for user ${userProfile.userId}`
          );
          break;
        case 5: // SUBSCRIPTION_ON_HOLD
        case 6: // SUBSCRIPTION_IN_GRACE_PERIOD
        case 9: // SUBSCRIPTION_DEFERRED
        case 11: // SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED
          // Subscription is temporarily inactive
          await removePlaidItemsForUser(userProfile.userId);
          if (subscription?.expiryTimeMillis)
            await db.userProfile.update({
              where: { userId: userProfile.userId },
              data: {
                subscriptionEnd: new Date(
                  parseInt(subscription.expiryTimeMillis)
                ),
              },
            });
          console.log(
            `Subscription on hold or paused for user ${userProfile.userId}`
          );
          break;
        case 8: // SUBSCRIPTION_PRICE_CHANGE_CONFIRMED
          console.log(
            `Subscription price change confirmed for user ${userProfile.userId}`
          );
          break;
        default:
          console.log(`Unknown notification type: ${notificationType}`);
      }
    }

    res.status(200).send();
  } catch (error) {
    console.error('Error verifying OIDC token:', error);
    appInsightsClient.trackException({
      exception: error,
    });
    res.status(401).send('Unauthorized: Token verification failed');
  }
}
