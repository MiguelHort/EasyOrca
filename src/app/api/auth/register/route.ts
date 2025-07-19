import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Valida se os campos necessários estão presentes
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nome, email ou senha inválidos" },
        { status: 400 }
      );
    }

    // Verifica se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "O email já está em uso" },
        { status: 400 }
      );
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco de dados
    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        phone: "99999-9999", // Placeholder, pode ser removido se não for necessário
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: "Usuário cadastrado com sucesso", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno ao cadastrar o usuário", error: (error as Error).message },
      { status: 500 }
    );
  }
}
