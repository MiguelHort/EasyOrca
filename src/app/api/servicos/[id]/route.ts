import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || "testeSIH";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.json({ error: "Usuário sem empresa vinculada" }, { status: 403 });
    }

    const { id } = await params;
    const { nome, preco } = (await req.json()) as { nome?: string; preco?: number | string };

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    let precoNumber: number | undefined;
    if (typeof preco !== "undefined") {
      precoNumber = typeof preco === "string" ? Number(preco.replace(",", ".")) : Number(preco);
      if (!Number.isFinite(precoNumber) || precoNumber < 0) {
        return NextResponse.json({ error: "Preço inválido" }, { status: 400 });
      }
    }

    const servico = await prisma.servico.findUnique({ where: { id } });
    if (!servico || servico.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou sem permissão" },
        { status: 404 }
      );
    }

    const atualizado = await prisma.servico.update({
      where: { id },
      data: { nome: nome.trim(), ...(typeof precoNumber === "number" ? { preco: precoNumber } : {}) },
    });

    return NextResponse.json(atualizado);
  } catch (err) {
    console.error("Erro no PATCH /servicos/:id:", err);
    return NextResponse.json({ error: "Erro ao atualizar serviço" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.json({ error: "Usuário sem empresa vinculada" }, { status: 403 });
    }

    const { id } = await params;

    const servico = await prisma.servico.findUnique({ where: { id } });
    if (!servico || servico.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou sem permissão" },
        { status: 404 }
      );
    }

    await prisma.servico.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro no DELETE /servicos/:id:", err);

    // Vinculado a orçamento (FK)
    if (err.code === "P2003") {
      return NextResponse.json(
        { error: "Não é possível excluir: serviço vinculado a orçamento." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Erro ao excluir serviço" }, { status: 500 });
  }
}
