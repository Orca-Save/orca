import db from './db';
import { appStoreClient, verifier } from '../controllers/appleController';

// Function to get transaction info using the App Store Server API Client
export async function getTransactionInfo(transactionId: string): Promise<any> {
  try {
    // Use the App Store Server API Client to get transaction info
    const transactionData = await appStoreClient.getTransactionInfo(
      transactionId
    );

    return transactionData;
  } catch (error: any) {
    console.error('Error getting transaction info:', error);
    throw new Error(`Failed to retrieve transaction info: ${error.message}`);
  }
}

// Function to process subscription data
export async function processSubscriptionData(
  transactionData: any,
  userId: string
): Promise<any> {
  try {
    const signedTransactionInfo = transactionData.signedTransactionInfo;

    // Verify and decode the signed transaction info
    const transactionInfo = await verifier.verifyAndDecodeTransaction(
      signedTransactionInfo
    );
    const originalTransactionId = transactionInfo.originalTransactionId;

    let isActive = false;
    let subscriptionEnd;
    const expiresDateMs = transactionInfo.expiresDate;
    if (expiresDateMs !== undefined) {
      (subscriptionEnd = new Date(expiresDateMs).toISOString()),
        (isActive = expiresDateMs > Date.now());
      // Save the subscription info in the user's profile
      await db.userProfile.update({
        where: { userId: userId },
        data: {
          appleSubscriptionId: originalTransactionId,
          subscriptionEnd: new Date(expiresDateMs),
        },
      });
    }

    return {
      ...transactionInfo,
      isActive,
      subscriptionEnd,
      productId: transactionInfo.productId,
      originalTransactionId,
    };
  } catch (error: any) {
    throw new Error(`Error processing subscription data: ${error.message}`);
  }
}

// Function to get Apple subscription status
export async function getAppleSubscriptionStatus(userId: string) {
  try {
    // Fetch the stored subscription ID from your database
    const userProfile = await db.userProfile.findUnique({
      where: { userId },
      select: {
        appleSubscriptionId: true,
      },
    });

    if (!userProfile || !userProfile.appleSubscriptionId) {
      return null;
    }

    const originalTransactionId = userProfile.appleSubscriptionId;

    // Fetch transaction info from Apple
    const transactionData = await getTransactionInfo(originalTransactionId);

    // Process the transaction data
    const subscriptionStatus = await processSubscriptionData(
      transactionData,
      userId
    );

    return subscriptionStatus;
  } catch (error: any) {
    console.error(
      `Error getting Apple subscription status for user ${userId}:`,
      error
    );
    throw new Error(`Failed to retrieve subscription status: ${error.message}`);
  }
}
