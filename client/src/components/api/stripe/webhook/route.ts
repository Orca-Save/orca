import { NextResponse } from 'next/server';

async function stripeWebhookHandler(req: any) {
  try {
    const {} = await req.json();
    // const plaidItem = await db.userProfile.findFirst({
    //   where: { itemId: item_id },
    // });

    // if (!plaidItem) {
    //   throw new Error('Plaid item not found');
    // }

    // switch (webhook_code) {

    //   default:
    //     console.log(`Unhandled webhook code: ${webhook_code}`);
    // }

    return NextResponse.json({ message: 'success' });
  } catch (e) {
    return NextResponse.json({ message: 'error' });
  }
}

export { stripeWebhookHandler as POST };
