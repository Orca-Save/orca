import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  const event = await stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  if (event.type === "charge.succeeded") {
    const charge = event.data.object;
    const goalId = charge.metadata.goalId;
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount;

    const goal = await db.goal.findUnique({ where: { id: goalId } });
    if (goal == null || email == null) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const userFields = {
      email,
      savings: { create: { goalId, pricePaidInCents } },
    };
    const {
      savings: [saving],
    } = await db.user.upsert({
      where: { email },
      create: userFields,
      update: userFields,
      select: { savings: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    const downloadVerification = await db.downloadVerification.create({
      data: {
        goalId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Saving Confirmation",
      react: (
        <PurchaseReceiptEmail
          saving={saving}
          goal={goal}
          downloadVerificationId={downloadVerification.id}
        />
      ),
    });
  }

  return new NextResponse();
}
