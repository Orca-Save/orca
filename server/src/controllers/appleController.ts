import { Request, Response } from 'express';

import { appInsightsClient } from '../utils/appInsights';
import { generateToken, processSubscriptionData } from '../utils/apple';

export const verifySubscription = async (req: Request, res: Response) => {
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
    const subscriptionInfo = await processSubscriptionData(data);

    // Return subscription info matching the expected format
    res.json(subscriptionInfo);
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    res.json({ isActive: false });
  }
};
