import admin from 'firebase-admin';
import db from './db';

const private_key = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert({
    // @ts-ignore
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: 'googleapis.com',
  }),
});

export const sendNotification = async (title: string, body: string) => {
  const message: admin.messaging.Message = {
    notification: {
      title,
      body,
    },
    token:
      'e8LNuu-BSiCq8_sB1gSwsG:APA91bF3m3jsBTK6EHM6BWj_5xWSfw61l-TdjBZRI2S2jcabPIaoaB88Xq-ek7JC1GP39-yuUIX-ct7xSx4lr8S2ZwICJIhYy8PZ7I96DLDn5W2J9FONZR2tuiqJrHoHCkmHuBgxmPFR',
  };

  return await admin.messaging().send(message);
};

export const notifyUserUnreadTransactions = async (userId: string) => {
  const userProfile = await db.userProfile.findFirst({
    where: { userId },
  });
  if (!userProfile) {
    console.error('User not found');
    return;
  } else if (!userProfile.notificationToken) {
    console.log('User does not have a notification token');
    return;
  }

  const unreadTransactionCount = await db.transaction.count({
    where: {
      userId,
      read: false,
    },
  });
  const title = `${unreadTransactionCount} Unread Transactions`;
  const body = `You have ${unreadTransactionCount} unread transactions to review.`;
  const message: admin.messaging.Message = {
    notification: {
      title,
      body,
    },
    token: userProfile.notificationToken,
  };
  return await admin.messaging().send(message);
};
