import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || "testeSIH";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: "Usuário sem empresa vinculada" }, { status: 403 });
    }

    const { id } = context.params;
    const body = await req.json();
    const { nome, email, telefone } = body;

    if (!nome || typeof nome !== "string") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    // Verifica se cliente existe e pertence à mesma empresa
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExistente || clienteExistente.companyId !== user.companyId) {
      return NextResponse.json({ error: "Cliente não encontrado ou sem permissão" }, { status: 404 });
    }

    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
      data: {
        nome,
        email,
        telefone,
      },
    });

    return NextResponse.json(clienteAtualizado);
  } catch (err) {
    console.error("Erro no PATCH /clientes/:id:", err);
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}
