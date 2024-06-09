import { createSubscription } from '@/app/(customerFacing)/user/_actions/stripe';
import { client } from '@/appInsights';
import { NextResponse } from 'next/server';

async function plaidWebhookHandler(req: any) {
  try {
    const { userId, email } = await req.json();
    return NextResponse.json(await createSubscription(userId, email));
  } catch (e) {
    client.trackException({ exception: e });
    return NextResponse.json({ message: 'error' });
  }
}

export { plaidWebhookHandler as POST };
