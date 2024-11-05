import { Request, Response } from "express";
import { User } from "../types/user";
import { appInsightsClient } from "../utils/appInsights";
import {
  getAppleSubscriptionStatus,
  getTransactionInfo,
  processSubscriptionData,
} from "../utils/apple";
import db from "../utils/db";
import { removePlaidItemsForUser } from "../utils/plaid";

export const verifySubscription = async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const userId = user.oid;
  const { transactionId } = req.body;
  appInsightsClient.trackEvent({
    name: "SubscriptionVerificationRequest",
    properties: { ...req.body },
  });

  if (!transactionId) {
    return res.status(400).json({ error: "Missing transaction ID." });
  }

  try {
    const transactionData = await getTransactionInfo(transactionId);
    const subscriptionInfo = await processSubscriptionData(
      transactionData,
      userId
    );

    // Return subscription info matching the expected format
    res.json(subscriptionInfo);
  } catch (error: any) {
    console.error("Error verifying subscription:", error);
    res.json({ isActive: false });
  }
};

export async function getSubscriptionStatus(req: Request, res: Response) {
  const user = (req as any).user as User;
  const userId = user.oid;

  try {
    const status = await getAppleSubscriptionStatus(userId);
    res.json(status);
  } catch (error: any) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function appleWebhook(req: Request, res: Response) {
  try {
    appInsightsClient.trackEvent({
      name: "AppleWebhookReceived",
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
      return res.status(404).send("User not found");
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
    if (status === "CANCEL" || status === "ACCOUNT_HOLD") {
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

    res.status(200).send("Webhook received and processed");
  } catch (error: any) {
    console.error("Error processing Apple subscription webhook:", error);
    appInsightsClient.trackException({ exception: error });

    // Log the error in the AppleWebhook table
    await db.appleWebhook.create({
      data: {
        userId: null, // If user ID is not available, set to null
        type: "ERROR",
        environment: req.body.environment || "Unknown",
        rawJson: req.body,
        error: { message: error.message, stack: error.stack },
      },
    });

    res.status(500).send("Internal server error");
  }
}
