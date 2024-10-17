import https from 'https';
import jwt from 'jsonwebtoken';
import db from './db';

const PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const KEY_ID = process.env.APPLE_KEY_ID || '';
const ISSUER_ID = process.env.APPLE_ISSUER_ID || '';
const BUNDLE_ID = process.env.APPLE_BUNDLE_ID || '';
const SHARED_SECRET = process.env.APPLE_SHARED_SECRET || ''; // Your app's shared secret

export function generateToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ISSUER_ID,
    iat: now,
    exp: now + 1800, // Token valid for 30 minutes
    aud: 'appstoreconnect-v1',
    bid: BUNDLE_ID,
  };

  const header = {
    alg: 'ES256',
    kid: KEY_ID,
    typ: 'JWT',
  };

  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: 'ES256', header });
  return token;
}

export async function verifyReceipt(receiptData: string): Promise<any> {
  const endpoint = 'https://sandbox.itunes.apple.com/verifyReceipt'; // Sandbox endpoint
  const requestBody = JSON.stringify({
    'receipt-data': receiptData,
    password: SHARED_SECRET,
    'exclude-old-transactions': true,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sandbox.itunes.apple.com',
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
          if (jsonData.status === 0) {
            // Receipt is valid
            resolve(jsonData);
          } else {
            // Handle different status codes
            reject(
              new Error(
                `Receipt validation failed with status: ${jsonData.status}`
              )
            );
          }
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

    const latestTransaction = latestReceiptInfo[latestReceiptInfo.length - 1];
    const expiresDateMs = parseInt(latestTransaction.expires_date_ms, 10);
    const isActive = expiresDateMs > Date.now();
    const originalTransactionId = latestTransaction.original_transaction_id; // Subscription ID

    // Save the subscription ID in the user's profile
    await db.userProfile.update({
      where: { userId: userId },
      data: {
        appleSubscriptionId: originalTransactionId,
        subscriptionEnd: new Date(expiresDateMs),
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
    // Fetch the stored transaction ID from your database
    const userProfile = await db.userProfile.findUnique({
      where: { userId },
      select: {
        appleSubscriptionId: true, // Assuming you store the subscription transaction ID
      },
    });

    if (!userProfile || !userProfile.appleSubscriptionId) {
      throw new Error('Transaction ID not found');
    }

    const transactionId = userProfile.appleSubscriptionId;

    // Generate JWT for authorization
    const jwtToken = generateToken();

    // Make the API call to the new StoreKit API endpoint
    const response = await fetch(
      `https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions/${transactionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`StoreKit API returned an error: ${response.statusText}`);
    }

    const data = await response.json();

    // Extract the relevant subscription data from StoreKit API response
    const latestTransaction = data.data?.[0]; // Assuming the first transaction is the most recent
    if (!latestTransaction) {
      throw new Error('No transactions found for this user');
    }

    const isActive = latestTransaction.expiresDate > Date.now();

    // Return the subscription status
    return {
      isActive,
      subscriptionEnd: latestTransaction.expiresDate
        ? new Date(parseInt(latestTransaction.expiresDate, 10)).toISOString()
        : null,
      priceAmountMicros: latestTransaction.price * 1e6, // Convert to micros
      priceCurrencyCode: latestTransaction.currencyCode,
    };
  } catch (error: any) {
    console.error(
      `Error getting Apple subscription status for user ${userId}:`,
      error
    );
    throw new Error(`Failed to retrieve subscription status: ${error.message}`);
  }
}
