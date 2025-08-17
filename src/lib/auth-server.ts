// lib/auth-server.ts
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getUserFromToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET); // payload.id vindo do login
    const id = payload.id as string | undefined;
    if (!id) return null;

    return await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, isPremium: true },
    });
  } catch {
    return null; // token inválido/expirado
  }
}
