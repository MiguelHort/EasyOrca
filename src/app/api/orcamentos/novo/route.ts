import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro";

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => ({}));
    const {
      clienteId,
      descricao = "",
      valorTotal,
      servicoIds = [],
    } = body || {};

    const valorNum =
      typeof valorTotal === "string" ? Number(valorTotal) : Number(valorTotal);

    if (!clienteId || !Number.isFinite(valorNum)) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando: clienteId e valorTotal" },
        { status: 400 }
      );
    }

    // Verifica se cliente pertence à empresa
    const cliente = await prisma.cliente.findFirst({
      where: {
        id: clienteId,
        companyId: user.companyId,
      },
      select: { id: true },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado para esta empresa" },
        { status: 404 }
      );
    }

    // Prepara os serviços (se houver)
    let itensParaCriar: {
      orcamentoId: string;
      servicoId: string;
      precoUnitario: Prisma.Decimal;
      quantidade: number;
    }[] = [];

    if (Array.isArray(servicoIds) && servicoIds.length > 0) {
      const ids = Array.from(
        new Set(
          servicoIds
            .filter((s: unknown) => typeof s === "string")
            .map((s: string) => s.trim())
            .filter(Boolean)
        )
      );

      const encontrados = await prisma.servico.findMany({
        where: {
          id: { in: ids },
          companyId: user.companyId,
        },
        select: { id: true, preco: true },
      });

      if (encontrados.length !== ids.length) {
        return NextResponse.json(
          { error: "Um ou mais serviços não pertencem à empresa" },
          { status: 400 }
        );
      }

      itensParaCriar = encontrados.map((s) => ({
        orcamentoId: "", // preenchido após criar
        servicoId: s.id,
        precoUnitario: s.preco,
        quantidade: 1,
      }));
    }

    // Criação via transação
    const result = await prisma.$transaction(async (tx) => {
      const orcamento = await tx.orcamento.create({
        data: {
          userId: payload.id,
          clienteId,
          descricao,
          valorTotal: new Prisma.Decimal(valorNum),
        },
      });

      if (itensParaCriar.length > 0) {
        await tx.orcamentoServico.createMany({
          data: itensParaCriar.map((it) => ({
            ...it,
            orcamentoId: orcamento.id,
          })),
        });
      }

      return await tx.orcamento.findUnique({
        where: { id: orcamento.id },
        include: {
          cliente: { select: { id: true, nome: true } },
          itens: {
            include: {
              servico: { select: { id: true, nome: true, preco: true } },
            },
          },
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    console.error("[POST /api/orcamentos/novo] Erro:", err);
    return NextResponse.json({ error: "Erro ao criar orçamento" }, { status: 500 });
  }
}
