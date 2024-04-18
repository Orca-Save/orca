import db from "@/db/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { CheckoutForm } from "./_components/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PurchasePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const goal = await db.goal.findUnique({ where: { id } });
  if (goal == null) return notFound();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: goal.balanceInCents,
    currency: "USD",
    metadata: { goalId: goal.id },
  });

  if (paymentIntent.client_secret == null) {
    throw Error("Stripe failed to create payment intent");
  }

  return (
    <CheckoutForm goal={goal} clientSecret={paymentIntent.client_secret} />
  );
}
