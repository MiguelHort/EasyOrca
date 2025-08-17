// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string | null;
      userName?: string | null;
    };

    // Campos obrigatórios
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nome, email ou senha inválidos" },
        { status: 400 }
      );
    }

    // Normalizações leves
    const normEmail = String(email).trim().toLowerCase();
    const normUserName =
      typeof body.userName === "string" && body.userName.trim() !== ""
        ? body.userName.trim()
        : undefined;
    const normPhone =
      typeof body.phone === "string" && body.phone.trim() !== ""
        ? body.phone.trim()
        : undefined;

    // Regras de unicidade
    const [existingByEmail, existingByUserName] = await Promise.all([
      prisma.user.findUnique({ where: { email: normEmail } }),
      normUserName
        ? prisma.user.findUnique({ where: { userName: normUserName } })
        : Promise.resolve(null),
    ]);

    if (existingByEmail) {
      return NextResponse.json(
        { message: "O email já está em uso" },
        { status: 400 }
      );
    }
    if (existingByUserName) {
      return NextResponse.json(
        { message: "Este nome de usuário já está em uso" },
        { status: 400 }
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Transação: cria Company e User vinculados
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          // Se quiser, troque por body.companyName quando tiver esse campo no form
          name: body.companyName,
          // image: "default.jpg", // já tem default no schema
        },
        select: { id: true, name: true },
      });

      const user = await tx.user.create({
        data: {
          id: crypto.randomUUID(),
          name,
          email: normEmail,
          passwordHash,
          phone: normPhone, // undefined quando vazio
          userName: normUserName, // undefined quando vazio
          companyId: company.id, // 🔗 vincula o usuário à empresa criada
        },
        // não retorne passwordHash para o cliente
        select: {
          id: true,
          name: true,
          email: true,
          userName: true,
          phone: true,
          companyId: true,
          createdAt: true,
        },
      });

      return { company, user };
    });

    return NextResponse.json(
      {
        message: "Usuário cadastrado com sucesso",
        user: result.user,
        company: result.company,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json(
      {
        message: "Erro interno ao cadastrar o usuário",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
