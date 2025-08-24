// lib/auth-server.ts
import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";
import { prisma } from "@/lib/prisma";

// Garanta que a mesma SECRET e algoritmo são usados no login e aqui.
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("Faltou JWT_SECRET no ambiente");
}
const SECRET = new TextEncoder().encode(JWT_SECRET);

// Ajuste para o algoritmo que você usa ao assinar o token (ex.: HS256)
const JWT_ALGS: Array<"HS256" | "HS384" | "HS512"> = ["HS256"];

// Tipo do payload que você assina no login
type AuthTokenPayload = JWTPayload & {
  id: string;          // id do usuário no seu banco
  email?: string;      // opcional
};

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  isPremium: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: "INACTIVE" | "INCOMPLETE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "UNPAID";
  currentPeriodEnd: Date | null;
};

export async function getUserFromToken(token?: string): Promise<AuthUser | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: JWT_ALGS });
    const { id } = payload as AuthTokenPayload;

    if (!id) return null;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isPremium: true,                // se você mantiver sincronizado via webhook
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionStatus: true,       // enum do seu schema
        currentPeriodEnd: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      isPremium: user.isPremium,
      stripeCustomerId: user.stripeCustomerId ?? null,
      stripeSubscriptionId: user.stripeSubscriptionId ?? null,
      subscriptionStatus: user.subscriptionStatus,
      currentPeriodEnd: user.currentPeriodEnd,
    };
  } catch {
    return null; // token inválido/expirado
  }
}

/**
 * Lê o cookie 'token' do App Router e retorna o usuário.
 * Use esta função dentro de rotas /api/* (server components / route handlers).
 */
export async function getUserFromCookies(): Promise<AuthUser | null> {
  // cookies() agora é assíncrono
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return getUserFromToken(token);
}

/**
 * Variante que lança erro 401 quando não autenticado — útil em rotas protegidas.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getUserFromCookies();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}
