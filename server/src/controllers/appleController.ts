import { Request, Response } from 'express';
import {
  AppStoreServerAPIClient,
  Environment,
  SignedDataVerifier,
} from '@apple/app-store-server-library';
import fs from 'fs';
import path from 'path';

import { User } from '../types/user';
import { appInsightsClient } from '../utils/appInsights';
import db from '../utils/db';
import { removePlaidItemsForUser } from '../utils/plaid';
import { processSubscriptionData } from '../utils/apple';

// Load environment variables or configuration
const issuerId = process.env.APPLE_ISSUER_ID!;
const keyId = process.env.APPLE_KEY_ID!;
const bundleId = process.env.APPLE_BUNDLE_ID!;
const appAppleId = parseInt(process.env.APPLE_APP_ID!);
const encodedPrivateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, '\n');
const environment =
  process.env.APPLE_ENVIRONMENT === 'PRODUCTION'
    ? Environment.PRODUCTION
    : Environment.SANDBOX;

// Initialize App Store Server API Client
export const appStoreClient = new AppStoreServerAPIClient(
  encodedPrivateKey,
  keyId,
  issuerId,
  bundleId,
  environment
);

// Load Apple Root Certificates
function loadRootCAs(): Buffer[] {
  const certsDir = path.join(__dirname, '../../certs');
  return fs
    .readdirSync(certsDir)
    .filter((file) => file.endsWith('.cer'))
    .map((file) => fs.readFileSync(path.join(certsDir, file)));
}

const appleRootCAs: Buffer[] = loadRootCAs();
const enableOnlineChecks = true; // Enable online revocation checks

// Initialize SignedDataVerifier
export const verifier = new SignedDataVerifier(
  appleRootCAs,
  enableOnlineChecks,
  environment,
  bundleId,
  appAppleId
);

// Verify Subscription Endpoint
export const verifySubscription = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const userId = user.oid;
  const { transactionId } = req.body;

  appInsightsClient.trackEvent({
    name: 'SubscriptionVerificationRequest',
    properties: { ...req.body },
  });

  if (!transactionId) {
    return res.status(400).json({ error: 'Missing transaction ID.' });
  }

  try {
    // Use App Store Server API to get transaction info
    const transactionInfo = await appStoreClient.getTransactionInfo(
      transactionId
    );

    // Process subscription data
    const subscriptionInfo = await processSubscriptionData(
      transactionInfo,
      userId
    );

    // Return subscription info matching the expected format
    res.json(subscriptionInfo);
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    res.json({ isActive: false });
  }
};
export async function getSubscriptionStatus(req: Request, res: Response) {
  const user = (req as any).user as User;
  const userId = user.oid;

  try {
    // Fetch the user's subscription ID from your database
    const userProfile = await db.userProfile.findUnique({
      where: { userId },
    });

    if (!userProfile || !userProfile.appleSubscriptionId) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    const transactionId = userProfile.appleSubscriptionId;

    // Get transaction info from Apple
    const transactionInfo = (await appStoreClient.getTransactionInfo(
      transactionId
    )) as any;

    // Process and return the subscription status
    res.json({
      isActive: true,
      expiresDate: transactionInfo.expiresDate,
      // ...other fields
    });
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: error.message });
  }
}

// Apple Webhook Handler
export async function appleWebhook(req: Request, res: Response) {
  try {
    appInsightsClient.trackEvent({
      name: 'AppleWebhookReceived',
      properties: req.body,
    });

    // Extract the signedPayload from the request body
    const signedPayload = req.body.signedPayload;

    if (!signedPayload) {
      console.error('Missing signedPayload in webhook');
      return res.status(400).send('Missing signedPayload');
    }

    // Verify and decode the notification
    const notification = await verifier.verifyAndDecodeNotification(
      signedPayload
    );

    // Extract relevant information from the notification
    const { notificationType, subtype, data } = notification;
    const environment = data?.environment || 'Unknown';

    let transactionInfo;
    if (data?.signedTransactionInfo)
      transactionInfo = await verifier.verifyAndDecodeTransaction(
        data?.signedTransactionInfo
      );

    if (!transactionInfo) {
      console.error('Error verifying transaction info');
      res.status(400).send('Error verifying transaction info');
      return;
    }
    // Verify and decode signedRenewalInfo
    let renewalInfo;
    if (data?.signedRenewalInfo)
      renewalInfo = await verifier.verifyAndDecodeRenewalInfo(
        data.signedRenewalInfo
      );

    const originalTransactionId = transactionInfo?.originalTransactionId;

    // Find the user based on the originalTransactionId
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
        type: notificationType,
        subtype: subtype,
        environment: environment,
        rawJson: JSON.stringify(notification),
        transactionInfo: JSON.stringify(transactionInfo),
        renewalInfo: JSON.stringify(renewalInfo),
      },
    });

    // Handle different notification types
    switch (notificationType) {
      case 'SUBSCRIBED':
        if (transactionInfo.expiresDate !== undefined) {
          await db.userProfile.updateMany({
            where: {
              appleSubscriptionId: originalTransactionId,
            },
            data: {
              subscriptionEnd: new Date(transactionInfo.expiresDate),
            },
          });
        }
        break;
      case 'DID_RENEW':
      case 'DID_RECOVER':
      case 'INITIAL_BUY':
        // Subscription is active or renewed
        // Update the user's subscription status
        if (transactionInfo.expiresDate !== undefined) {
          await db.userProfile.updateMany({
            where: {
              appleSubscriptionId: originalTransactionId,
            },
            data: {
              subscriptionEnd: new Date(transactionInfo.expiresDate),
            },
          });
        }
        break;

      case 'CANCEL':
      case 'DID_FAIL_TO_RENEW':
        // Subscription has been canceled or failed to renew
        await removePlaidItemsForUser(userId);

        // Update the user's subscription status
        await db.userProfile.updateMany({
          where: {
            appleSubscriptionId: originalTransactionId,
          },
          data: {
            subscriptionEnd: new Date(), // Set expiration to now
          },
        });
        break;

      // Handle other notification types as needed
      default:
        console.log(`Unhandled notification type: ${notificationType}`);
    }

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
        rawJson: JSON.stringify(req.body),
        error: JSON.stringify({ message: error.message, stack: error.stack }),
      },
    });

    res.status(500).send('Internal server error');
  }
}
