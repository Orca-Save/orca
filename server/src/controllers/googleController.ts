import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { appInsightsClient } from '../utils/appInsights';
import { getGoogleSubscriptionStatusByToken } from '../utils/googleCloud';

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

    // Optionally, verify the token issuer and service account email
    const expectedIssuer = 'https://accounts.google.com';
    const expectedEmail = process.env.CLOUD_CLIENT_EMAIL;

    if (payload.iss !== expectedIssuer || payload.email !== expectedEmail) {
      res.status(401).send('Unauthorized: Invalid token issuer or email');
      return;
    }

    // Token is valid; proceed to process the Pub/Sub message
    const pubsubMessage = req.body.message;
    const messageData = Buffer.from(pubsubMessage.data, 'base64').toString(
      'utf-8'
    );
    const messageJson = JSON.parse(messageData);
    const subscriptionNotification = JSON.parse(
      messageJson.subscriptionNotification
    );
    appInsightsClient.trackEvent({
      name: 'GoogleWebhookVerified',
      properties: messageJson,
    });

    const purchaseToken = subscriptionNotification.purchaseToken;
    // get subscription status
    const subscription = await getGoogleSubscriptionStatusByToken(
      purchaseToken
    );

    res.status(200).send(); // Acknowledge successful processing
  } catch (error) {
    console.error('Error verifying OIDC token:', error);
    appInsightsClient.trackException({
      exception: error,
    });
    res.status(401).send('Unauthorized: Token verification failed');
  }
}
