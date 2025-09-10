// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-server"; // usa cookies() internamente (com await)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Dica: pode omitir apiVersion; se quiser fixar, use o valor que seu SDK pede.
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-07-30.basil" as any });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const user = await requireUser(); // garante usuário autenticado (lê cookie 'token')
    // user: { id, email, name, stripeCustomerId, ... }

    // Garante customer na Stripe
    let stripeCustomerId = user.stripeCustomerId ?? null;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { app_user_id: user.id },
      });
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: process.env.PRICE_ID_49!, quantity: 1 }],
      allow_promotion_codes: true, // cliente digita ONEORCA29 no Checkout
      success_url: `https://easyorca.com/`,
      cancel_url: `https://easyorca.com/`,
      automatic_tax: { enabled: false },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    // requireUser lança "UNAUTHENTICATED" se não tiver login
    if (err?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    console.error("Erro em /api/checkout:", err);
    return NextResponse.json(
      { error: "Falha ao iniciar checkout" },
      { status: 500 }
    );
  }
}
