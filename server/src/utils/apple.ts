import jwt from "jsonwebtoken";
import db from "./db";

const PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";
const KEY_ID = process.env.APPLE_KEY_ID || "";
const ISSUER_ID = process.env.APPLE_ISSUER_ID || "";

export function generateToken(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: ISSUER_ID,
    iat: now,
    exp: now + 1800, // Token valid for 30 minutes
    aud: "appstoreconnect-v1",
    bid: "com.orcamoney.app",
  };

  const header = {
    alg: "ES256",
    kid: KEY_ID,
    typ: "JWT",
  };

  const token = jwt.sign(payload, PRIVATE_KEY, { algorithm: "ES256", header });
  return token;
}

export async function getTransactionInfo(transactionId: string): Promise<any> {
  const productionEndpoint =
    "https://api.storekit.itunes.apple.com/inApps/v1/transactions";
  const sandboxEndpoint =
    "https://api.storekit-sandbox.itunes.apple.com/inApps/v1/transactions";

  try {
    // Generate JWT for authorization
    const jwtToken = generateToken();

    // Determine the correct endpoint (production or sandbox)
    let endpoint = sandboxEndpoint;

    // First, try the production environment
    let response = await fetch(`${endpoint}/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (response.status === 404) {
      // If not found in production, try sandbox
      endpoint = sandboxEndpoint;
      response = await fetch(`${endpoint}/${transactionId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
    }

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const clonedResponse = response.clone();
      const errorResponse = await clonedResponse.text();
      console.log("Body:", errorResponse);
      console.error("Error fetching transaction info:", errorResponse);
      throw new Error(`App Store Server API error: ${errorResponse}`);
    }

    const data = await response.json();

    return data;
  } catch (error: any) {
    console.error("Error getting transaction info:", error);
    throw new Error(`Failed to retrieve transaction info: ${error.message}`);
  }
}

export async function processSubscriptionData(
  transactionData: any,
  userId: string
): Promise<any> {
  try {
    const signedTransactionInfo = transactionData.signedTransactionInfo;

    // Decode the signed transaction
    const decodedTransaction = jwt.decode(signedTransactionInfo, {
      complete: true,
    });

    if (!decodedTransaction) {
      throw new Error("Failed to decode transaction payload");
    }

    const transactionInfo = decodedTransaction.payload as any;

    const expiresDateMs = parseInt(transactionInfo.expiresDate, 10);
    const isActive = expiresDateMs > Date.now();
    const originalTransactionId = transactionInfo.originalTransactionId;

    // Save the subscription info in the user's profile
    await db.userProfile.update({
      where: { userId: userId },
      data: {
        appleSubscriptionId: originalTransactionId,
        subscriptionEnd: new Date(expiresDateMs),
      },
    });

    return {
      isActive,
      subscriptionEnd: new Date(expiresDateMs).toISOString(),
      productId: transactionInfo.productId,
      originalTransactionId,
    };
  } catch (error: any) {
    throw new Error(`Error processing subscription data: ${error.message}`);
  }
}

export async function getAppleSubscriptionStatus(userId: string) {
  // try {
  //   // Fetch the stored receipt data from your database
  //   const userProfile = await db.userProfile.findUnique({
  //     where: { userId },
  //     select: {
  //       appleReceiptData: true, // Assuming you store the receipt data
  //     },
  //   });
  //   if (!userProfile || !userProfile.appleReceiptData) {
  //     return { isActive: false };
  //   }
  //   const receiptData = userProfile.appleReceiptData;
  //   // Verify the receipt with Apple
  //   const receiptInfo = await verifyReceipt(receiptData);
  //   const latestReceiptInfo = receiptInfo.latest_receipt_info;
  //   if (!latestReceiptInfo || latestReceiptInfo.length === 0) {
  //     return { isActive: false };
  //   }
  //   // Find the latest subscription receipt
  //   const sortedReceipts = latestReceiptInfo.sort((a: any, b: any) => {
  //     return parseInt(b.expires_date_ms, 10) - parseInt(a.expires_date_ms, 10);
  //   });
  //   const latestTransaction = sortedReceipts[0];
  //   const expiresDateMs = parseInt(latestTransaction.expires_date_ms, 10);
  //   const isActive = expiresDateMs > Date.now();
  //   // Return the subscription status
  //   return {
  //     isActive,
  //     subscriptionEnd: new Date(expiresDateMs).toISOString(),
  //     productId: latestTransaction.product_id,
  //     originalTransactionId: latestTransaction.original_transaction_id,
  //   };
  // } catch (error: any) {
  //   console.error(
  //     `Error getting Apple subscription status for user ${userId}:`,
  //     error
  //   );
  //   throw new Error(`Failed to retrieve subscription status: ${error.message}`);
  // }
}
