// app/api/billing-portal/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
// use o helper do server que lê o cookie 'token'
import { requireUser } from "@/lib/auth-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Pode omitir apiVersion; se precisar fixar, use a que seu SDK exigir.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const user = await requireUser(); // lança se não autenticado

    // Garante que exista um customer na Stripe
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

    const origin = new URL(req.url).origin;

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/conta`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    if (err?.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("Erro em /api/billing-portal:", err);
    return NextResponse.json({ error: "Falha ao abrir o portal" }, { status: 500 });
  }
}
