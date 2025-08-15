// src/app/api/orcamentos/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
// use o singleton para evitar many PrismaClients em dev
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro";
const STATUS_OPTIONS = new Set(["rascunho", "enviado", "aprovado", "rejeitado"]);

// GET /api/orcamentos/:id
export async function GET(_req: Request, { params }: any) {
  const token = (await cookies()).get("token")?.value;
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

    const { id } = params as { id: string };

    const o = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        user: { select: { companyId: true } },
        cliente: {
          select: { id: true, nome: true, email: true, telefone: true, companyId: true },
        },
        itens: {
          include: { servico: { select: { id: true, nome: true } } },
          orderBy: { id: "asc" },
        },
      },
    });

    if (!o || o.user.companyId !== user.companyId || o.cliente.companyId !== user.companyId) {
      return NextResponse.json({ error: "Orçamento não encontrado ou sem permissão" }, { status: 404 });
    }

    const itens = (o.itens ?? []).map((it) => {
      const quantidade = Number(it.quantidade);
      const precoUnitario = Number(it.precoUnitario);
      return {
        id: it.id,
        servicoId: it.servico?.id ?? null,
        servicoNome: it.servico?.nome ?? "Serviço",
        quantidade,
        precoUnitario,
        subtotal: quantidade * precoUnitario,
      };
    });

    const totalCalculadoDosItens = itens.reduce((acc, i) => acc + i.subtotal, 0);

    return NextResponse.json(
      {
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
        valorTotal: Number(o.valorTotal),
        itens,
        totalCalculadoDosItens,
      },
      { status: 200 }
    );
  } catch (err: any) {
    if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
    }
    console.error("Erro no GET /api/orcamentos/:id:", err);
    return NextResponse.json({ error: "Erro ao buscar orçamento" }, { status: 500 });
  }
}

// PATCH /api/orcamentos/:id
export async function PATCH(req: Request, { params }: any) {
  const token = (await cookies()).get("token")?.value;
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

    const { id } = params as { id: string };
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
    if (!orcamento || orcamento.user.companyId !== user.companyId || orcamento.cliente.companyId !== user.companyId) {
      return NextResponse.json({ error: "Orçamento não encontrado ou sem permissão" }, { status: 404 });
    }

    // valida valorTotal (opcional)
    let valorNumber: number | undefined = undefined;
    if (typeof body.valorTotal !== "undefined") {
      valorNumber =
        typeof body.valorTotal === "string"
          ? Number(String(body.valorTotal).replace(",", "."))
          : Number(body.valorTotal);
      if (!Number.isFinite(valorNumber) || valorNumber < 0) {
        return NextResponse.json({ error: "Valor total inválido" }, { status: 400 });
      }
    }

    // valida status (opcional)
    if (typeof body.status !== "undefined" && !STATUS_OPTIONS.has(body.status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    // troca de cliente (opcional) precisa ser da mesma empresa
    if (body.clienteId) {
      const cliente = await prisma.cliente.findUnique({
        where: { id: body.clienteId },
        select: { id: true, companyId: true },
      });
      if (!cliente || cliente.companyId !== user.companyId) {
        return NextResponse.json({ error: "Cliente inválido para esta empresa" }, { status: 400 });
      }
    }

    const atualizado = await prisma.orcamento.update({
      where: { id },
      data: {
        ...(typeof body.descricao !== "undefined" ? { descricao: body.descricao } : {}),
        ...(typeof valorNumber === "number" ? { valorTotal: valorNumber } : {}),
        ...(typeof body.status === "string" ? { status: body.status } : {}),
        ...(body.clienteId ? { clienteId: body.clienteId } : {}),
      },
      include: { cliente: { select: { id: true, nome: true } } },
    });

    return NextResponse.json(atualizado, { status: 200 });
  } catch (err) {
    console.error("Erro no PATCH /api/orcamentos/:id:", err);
    return NextResponse.json({ error: "Erro ao atualizar orçamento" }, { status: 500 });
  }
}

// DELETE /api/orcamentos/:id
export async function DELETE(_req: Request, { params }: any) {
  const token = (await cookies()).get("token")?.value;
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

    const { id } = params as { id: string };

    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        user: { select: { companyId: true } },
        cliente: { select: { companyId: true } },
      },
    });
    if (!orcamento || orcamento.user.companyId !== user.companyId || orcamento.cliente.companyId !== user.companyId) {
      return NextResponse.json({ error: "Orçamento não encontrado ou sem permissão" }, { status: 404 });
    }

    // apaga itens primeiro se não houver ON DELETE CASCADE
    await prisma.orcamentoServico.deleteMany({ where: { orcamentoId: id } });
    await prisma.orcamento.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Erro no DELETE /api/orcamentos/:id:", err);
    return NextResponse.json({ error: "Erro ao excluir orçamento" }, { status: 500 });
  }
}
