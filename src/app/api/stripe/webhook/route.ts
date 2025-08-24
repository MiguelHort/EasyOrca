import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! /* , { apiVersion: "2025-07-30.basil" } */);

function mapStatus(s: Stripe.Subscription.Status) {
  switch (s) {
    case "trialing": return "TRIALING";
    case "active": return "ACTIVE";
    case "past_due": return "PAST_DUE";
    case "canceled": return "CANCELED";
    case "unpaid": return "UNPAID";
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE";
    default:
      return "INACTIVE";
  }
}

// Lê current period end em snake_case OU camelCase
function getCurrentPeriodEnd(sub: Stripe.Subscription): Date | null {
  const snake = (sub as any).current_period_end as number | undefined;
  const camel = (sub as any).currentPeriodEnd as number | undefined;
  const ts = snake ?? camel;
  return ts ? new Date(ts * 1000) : null;
}

async function upsertFromSubscription(sub: Stripe.Subscription) {
  const customerId = sub.customer as string;

  // price (com expand nos retrieves) continua igual
  const price = sub.items.data[0]?.price as Stripe.Price | undefined;
  const planNickname = price?.nickname ?? null;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: sub.id,
      subscriptionStatus: mapStatus(sub.status) as any,
      currentPeriodEnd: getCurrentPeriodEnd(sub),
      priceId: price?.id ?? null,
      planNickname,
      isPremium: sub.status === "active" || sub.status === "trialing",
    },
  });
}

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature")!;
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string, {
          expand: ["items.data.price"],
        });
        await upsertFromSubscription(sub);
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      await upsertFromSubscription(sub);
    }
  } catch (e) {
    // log/observabilidade opcional
    console.error("Webhook processing error:", e);
  }

  return NextResponse.json({ received: true });
}
