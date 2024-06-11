import { createSubscription } from '@/app/(customerFacing)/user/_actions/stripe';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

async function stripeSubscriptionHandler(req: any) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ message: 'Not signed in' }, { status: 401 });
    }
    const { userId, email } = await req.json();
    return NextResponse.json(await createSubscription(userId, email));
  } catch (e) {
    return NextResponse.json({ message: 'error' }, { status: 500 });
  }
}

export { stripeSubscriptionHandler as POST };
