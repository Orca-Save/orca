import https from 'https';
import db from './db';

const SHARED_SECRET = process.env.APPLE_SHARED_SECRET || ''; // Your app's shared secret

export async function verifyReceipt(receiptData: string): Promise<any> {
  const productionEndpoint = 'https://buy.itunes.apple.com/verifyReceipt';
  const sandboxEndpoint = 'https://sandbox.itunes.apple.com/verifyReceipt';
  const requestBody = JSON.stringify({
    'receipt-data': receiptData,
    password: SHARED_SECRET,
    'exclude-old-transactions': true,
  });

  async function sendRequest(endpoint: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: new URL(endpoint).hostname,
        port: 443,
        path: '/verifyReceipt',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error: any) {
            reject(new Error(`Error parsing response: ${error.message}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Error verifying receipt: ${error.message}`));
      });

      req.write(requestBody);
      req.end();
    });
  }

  // First, try the production endpoint
  try {
    const response = await sendRequest(productionEndpoint);
    if (response.status === 0) {
      return response;
    } else if (response.status === 21007) {
      // Receipt is from sandbox, try sandbox endpoint
      const sandboxResponse = await sendRequest(sandboxEndpoint);
      if (sandboxResponse.status === 0) {
        return sandboxResponse;
      } else {
        throw new Error(`Receipt validation failed with status: ${sandboxResponse.status}`);
      }
    } else {
      throw new Error(`Receipt validation failed with status: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
}

export async function processSubscriptionData(
  receiptData: string,
  userId: string
): Promise<any> {
  try {
    const receiptInfo = await verifyReceipt(receiptData);

    const latestReceiptInfo = receiptInfo.latest_receipt_info;
    if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
      return { isActive: false };
    }

    // Find the latest subscription receipt
    const sortedReceipts = latestReceiptInfo.sort((a: any, b: any) => {
      return parseInt(b.expires_date_ms, 10) - parseInt(a.expires_date_ms, 10);
    });

    const latestTransaction = sortedReceipts[0];
    const expiresDateMs = parseInt(latestTransaction.expires_date_ms, 10);
    const isActive = expiresDateMs > Date.now();
    const originalTransactionId = latestTransaction.original_transaction_id; // Subscription ID

    // Save the receipt data and subscription ID in the user's profile
    await db.userProfile.update({
      where: { userId: userId },
      data: {
        appleSubscriptionId: originalTransactionId,
        subscriptionEnd: new Date(expiresDateMs),
        appleReceiptData: receiptData, // Store receipt data
      },
    });

    return {
      isActive,
      expiryTimeMillis: expiresDateMs,
      productId: latestTransaction.product_id,
      originalTransactionId,
    };
  } catch (error: any) {
    throw new Error(`Error processing subscription data: ${error.message}`);
  }
}

export async function getAppleSubscriptionStatus(userId: string) {
  try {
    // Fetch the stored receipt data from your database
    const userProfile = await db.userProfile.findUnique({
      where: { userId },
      select: {
        appleReceiptData: true, // Assuming you store the receipt data
      },
    });

    if (!userProfile || !userProfile.appleReceiptData) {
      throw new Error('Receipt data not found');
    }

    const receiptData = userProfile.appleReceiptData;

    // Verify the receipt with Apple
    const receiptInfo = await verifyReceipt(receiptData);

    const latestReceiptInfo = receiptInfo.latest_receipt_info;
    if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
      return { isActive: false };
    }

    // Find the latest subscription receipt
    const sortedReceipts = latestReceiptInfo.sort((a: any, b: any) => {
      return parseInt(b.expires_date_ms, 10) - parseInt(a.expires_date_ms, 10);
    });

    const latestTransaction = sortedReceipts[0];
    const expiresDateMs = parseInt(latestTransaction.expires_date_ms, 10);
    const isActive = expiresDateMs > Date.now();

    // Return the subscription status
    return {
      isActive,
      subscriptionEnd: new Date(expiresDateMs).toISOString(),
      productId: latestTransaction.product_id,
      originalTransactionId: latestTransaction.original_transaction_id,
    };
  } catch (error: any) {
    console.error(
      `Error getting Apple subscription status for user ${userId}:`,
      error
    );
    throw new Error(`Failed to retrieve subscription status: ${error.message}`);
  }
}
