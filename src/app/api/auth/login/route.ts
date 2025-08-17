import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

const prisma = new PrismaClient();

// ✅ Use a mesma env do middleware (nada de NEXT_PUBLIC aqui)
const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro";
const expiresIn = (process.env.NEXT_PUBLIC_JWT_EXPIRATION || "8h") as SignOptions["expiresIn"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, passwordHash } = body;

    if (!email || !passwordHash) {
      return NextResponse.json(
        { message: "Email ou senha inválido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email ou senha inválido" },
        { status: 401 }
      );
    }

    // Valida senha
    const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email ou senha inválido" },
        { status: 401 }
      );
    }

    // ✅ Inclua isPremium no payload (pode incluir outros campos que usar no middleware)
    const payload = {
      id: user.id,
      isPremium: user.isPremium,
      // opcional: companyId: user.companyId,
      // opcional: name: user.name,
    };

    // Gera token JWT
    const token = jwt.sign(payload, secretKey, { expiresIn });

    const response = NextResponse.json(
      { message: "Login realizado com sucesso" },
      { status: 200 }
    );

    // Define cookie com token JWT
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 480 * 60, // 8 horas
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
