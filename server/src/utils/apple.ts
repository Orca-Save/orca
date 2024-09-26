import jwt from 'jsonwebtoken';

const PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
const KEY_ID = process.env.APPLE_KEY_ID || '';
const ISSUER_ID = process.env.APPLE_ISSUER_ID || '';
const BUNDLE_ID = process.env.APPLE_BUNDLE_ID || '';

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

export async function processSubscriptionData(data: any): Promise<any> {
  const latestTransaction = data.data?.[0];

  if (!latestTransaction) {
    return { isActive: false };
  }

  const transactionInfo = parseSignedTransaction(
    latestTransaction.signedTransaction
  );

  if (!transactionInfo) {
    return { isActive: false };
  }

  const expiresDateMs = parseInt(transactionInfo.expiresDate, 10);
  const isActive = expiresDateMs > Date.now();
  const priceAmountMicros = transactionInfo.priceAmountMicros;
  const priceCurrencyCode = transactionInfo.currencyCode;
  const subscriptionStatus = transactionInfo.subscriptionStatus;

  return {
    isActive,
    expiryTimeMillis: expiresDateMs,
    priceAmountMicros,
    priceCurrencyCode,
    subscriptionStatus,
  };
}

function parseSignedTransaction(signedTransaction: string): any {
  const decoded = jwt.decode(signedTransaction, { complete: true });

  if (!decoded) {
    return null;
  }

  const payload = decoded.payload as any;

  return {
    expiresDate: payload.expirationDate,
    purchaseDate: payload.purchaseDate,
    productId: payload.productId,
    transactionId: payload.transactionId,
    originalTransactionId: payload.originalTransactionId,
    subscriptionStatus: payload.status,
    priceAmountMicros: payload.price * 1e6, // Assuming price is in dollars
    currencyCode: payload.currency,
  };
}
