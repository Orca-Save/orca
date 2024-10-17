import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../types/user';
import { appInsightsClient } from '../utils/appInsights';
import { generateToken, processSubscriptionData } from '../utils/apple';
import db from '../utils/db';
import { removePlaidItemsForUser } from '../utils/plaid';

export const verifySubscription = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const userId = user.oid;
  const { originalTransactionId } = req.body;
  appInsightsClient.trackEvent({
    name: 'SubscriptionVerificationRequest',
    properties: { originalTransactionId },
  });

  if (!originalTransactionId) {
    return res.status(400).json({ error: 'Missing original transaction ID.' });
  }

  try {
    const token = generateToken();
    const url = `https://api.storekit.itunes.apple.com/inApps/v1/subscriptions/${originalTransactionId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error('Error fetching subscription status:', errorResponse);
      return res.json({ isActive: false });
    }

    const data = await response.json();

    appInsightsClient.trackEvent({
      name: 'SubscriptionVerification',
      properties: data,
    });
    const subscriptionInfo = await processSubscriptionData(data, userId);

    // Return subscription info matching the expected format
    res.json(subscriptionInfo);
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    res.json({ isActive: false });
  }
};

export async function appleWebhook(req: Request, res: Response) {
  try {
    appInsightsClient.trackEvent({
      name: 'AppleWebhookReceived',
      properties: req.body,
    });
    const notification = req.body;
    const latestReceiptInfo = notification.latest_receipt_info;
    const originalTransactionId = latestReceiptInfo?.original_transaction_id;
    const status = notification.notification_type;
    const environment = notification.environment;
    const user = await db.userProfile.findFirst({
      where: { appleSubscriptionId: originalTransactionId },
      select: { userId: true },
    });

    const userId = user?.userId;
    if (!userId) {
      return res.status(404).send('User not found');
    }

    // Record the Apple subscription event in the AppleWebhook table
    await db.appleWebhook.create({
      data: {
        userId: userId,
        type: status,
        environment: environment,
        rawJson: notification,
        json: latestReceiptInfo,
      },
    });

    // Remove Plaid items for canceled or paused subscriptions
    if (status === 'CANCEL' || status === 'ACCOUNT_HOLD') {
      await removePlaidItemsForUser(userId);
    }

    // Update the user’s subscription status
    const expirationDate = new Date(
      parseInt(latestReceiptInfo?.expires_date_ms)
    );
    await db.userProfile.updateMany({
      where: {
        appleSubscriptionId: originalTransactionId,
      },
      data: {
        subscriptionEnd: expirationDate,
      },
    });

    res.status(200).send('Webhook received and processed');
  } catch (error: any) {
    console.error('Error processing Apple subscription webhook:', error);
    appInsightsClient.trackException({ exception: error });

    // Log the error in the AppleWebhook table
    await db.appleWebhook.create({
      data: {
        userId: null, // If user ID is not available, set to null
        type: 'ERROR',
        environment: req.body.environment || 'Unknown',
        rawJson: req.body,
        error: { message: error.message, stack: error.stack },
      },
    });

    res.status(500).send('Internal server error');
  }
}

/**
 * Verifies the signed transaction info from Apple.
 * @param notification The incoming webhook notification from Apple
 * @returns Boolean indicating whether the notification is valid
 */
export function verifyAppleNotification(notification: any): boolean {
  const signedTransactionInfo = notification.signedTransactionInfo;

  if (!signedTransactionInfo) {
    return false;
  }

  // Apple provides a public key for verifying their signed JWT tokens
  const publicKey = process.env.APPLE_PUBLIC_KEY || ''; // Fetch from Apple API

  try {
    // Verify the JWT signature using Apple's public key
    const decoded = jwt.verify(signedTransactionInfo, publicKey, {
      algorithms: ['ES256'], // Apple uses ES256 algorithm
    });

    return !!decoded;
  } catch (error) {
    console.error('Failed to verify Apple notification:', error);
    return false;
  }
}
