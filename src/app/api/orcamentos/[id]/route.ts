import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
// Mantenha JWT apenas no servidor (não use NEXT_PUBLIC aqui)
const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro";
const STATUS_OPTIONS = new Set([
  "rascunho",
  "enviado",
  "aprovado",
  "rejeitado",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.json(
        { error: "Usuário sem empresa vinculada" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = (await req.json()) as {
      descricao?: string | null;
      valorTotal?: number | string;
      status?: string;
      clienteId?: string;
    };

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        user: { select: { companyId: true } },
        cliente: { select: { companyId: true } },
      },
    });
    if (
      !orcamento ||
      orcamento.user.companyId !== user.companyId ||
      orcamento.cliente.companyId !== user.companyId
    ) {
      return NextResponse.json(
        { error: "Orçamento não encontrado ou sem permissão" },
        { status: 404 }
      );
    }

    // valida valorTotal (opcional)
    let valorNumber: number | undefined = undefined;
    if (typeof body.valorTotal !== "undefined") {
      valorNumber =
        typeof body.valorTotal === "string"
          ? Number(String(body.valorTotal).replace(",", "."))
          : Number(body.valorTotal);
      if (!Number.isFinite(valorNumber) || valorNumber < 0) {
        return NextResponse.json(
          { error: "Valor total inválido" },
          { status: 400 }
        );
      }
    }

    // valida status (opcional)
    if (
      typeof body.status !== "undefined" &&
      !STATUS_OPTIONS.has(body.status)
    ) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    // se trocar cliente, garantir que é da mesma empresa
    if (body.clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: body.clienteId },
        select: { id: true, companyId: true },
      });
      if (!cliente || cliente.companyId !== user.companyId) {
        return NextResponse.json(
          { error: "Cliente inválido para esta empresa" },
          { status: 400 }
        );
      }
    }

    const atualizado = await prisma.orcamento.update({
      where: { id },
      data: {
        ...(typeof body.descricao !== "undefined"
          ? { descricao: body.descricao }
          : {}),
        ...(typeof valorNumber === "number" ? { valorTotal: valorNumber } : {}),
        ...(typeof body.status === "string" ? { status: body.status } : {}),
        ...(body.clienteId ? { clienteId: body.clienteId } : {}),
      },
      include: {
        cliente: { select: { id: true, nome: true } },
      },
    });

    return NextResponse.json(atualizado, { status: 200 });
  } catch (err) {
    console.error("Erro no PATCH /orcamentos/:id:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar orçamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.json(
        { error: "Usuário sem empresa vinculada" },
        { status: 403 }
      );
    }

    const { id } = params;

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        user: { select: { companyId: true } },
        cliente: { select: { companyId: true } },
      },
    });
    if (
      !orcamento ||
      orcamento.user.companyId !== user.companyId ||
      orcamento.cliente.companyId !== user.companyId
    ) {
      return NextResponse.json(
        { error: "Orçamento não encontrado ou sem permissão" },
        { status: 404 }
      );
    }

    // apaga itens primeiro se não houver ON DELETE CASCADE
    await prisma.orcamentoServico.deleteMany({ where: { orcamentoId: id } });
    await prisma.orcamento.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Erro no DELETE /orcamentos/:id:", err);
    return NextResponse.json(
      { error: "Erro ao excluir orçamento" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.json({ error: "Usuário sem empresa vinculada" }, { status: 403 });
    }

    const { id } = params;

    const o = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        user: { select: { companyId: true } },
        cliente: { select: { id: true, nome: true, email: true, telefone: true, companyId: true } },
        itens: {
          include: {
            servico: { select: { id: true, nome: true } }, // Servico não tem descricao no seu schema
          },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!o || o.user.companyId !== user.companyId || o.cliente.companyId !== user.companyId) {
      return NextResponse.json({ error: "Orçamento não encontrado ou sem permissão" }, { status: 404 });
    }

    const itens = (o.itens ?? []).map((it) => ({
      id: it.id,
      servicoId: it.servico?.id ?? null,
      servicoNome: it.servico?.nome ?? "Serviço",
      quantidade: Number(it.quantidade),
      precoUnitario: Number(it.precoUnitario), // Decimal -> number
      subtotal: Number(it.precoUnitario) * Number(it.quantidade),
    }));

    const valorItens = itens.reduce((acc, i) => acc + i.subtotal, 0);

    const payloadResp = {
      id: o.id,
      cliente: {
        id: o.cliente.id,
        nome: o.cliente.nome,
        email: o.cliente.email ?? null,
        telefone: o.cliente.telefone ?? null,
      },
      descricao: o.descricao ?? null,
      status: o.status,
      data: o.createdAt.toISOString(),
      valorTotal: Number(o.valorTotal.toString()), // Decimal -> number com segurança
      itens,
      totalCalculadoDosItens: valorItens, // útil para conferência
    };

    return NextResponse.json(payloadResp, { status: 200 });
  } catch (err: any) {
    if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
    }
    console.error("Erro no GET /api/orcamentos/:id:", err);
    return NextResponse.json({ error: "Erro ao buscar orçamento" }, { status: 500 });
  }
}
