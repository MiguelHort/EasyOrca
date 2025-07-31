import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Use um segredo do lado do servidor (NÃO usar NEXT_PUBLIC_)
const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const body = await req.json().catch(() => ({}));
    const {
      clienteId,
      descricao = "",
      valorTotal,          // number|string esperado
      servicoIds = [],     // string[] opcional (IDs dos serviços)
      // futuramente: itens: { servicoId, quantidade }[]
    } = body || {};

    // ---- Validação básica
    const valorNum =
      typeof valorTotal === "string" ? Number(valorTotal) : Number(valorTotal);
    if (!clienteId || !Number.isFinite(valorNum)) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando: clienteId e valorTotal" },
        { status: 400 }
      );
    }

    // ---- Verifica cliente pertence ao usuário
    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, userId: payload.id },
      select: { id: true },
    });
    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // ---- Normaliza/valida serviços (se enviados)
    let itensParaCriar:
      | { orcamentoId: string; servicoId: string; precoUnitario: Prisma.Decimal; quantidade: number }[]
      | [] = [];

    if (Array.isArray(servicoIds) && servicoIds.length > 0) {
      // dedupe + sanitize
      const ids = Array.from(
        new Set(
          servicoIds
            .filter((s: unknown) => typeof s === "string")
            .map((s: string) => s.trim())
            .filter(Boolean)
        )
      );

      if (ids.length > 0) {
        // Garante que serviços existem e pertencem ao usuário
        const encontrados = await prisma.servico.findMany({
          where: { id: { in: ids }, userId: payload.id },
          select: { id: true, preco: true },
        });

        if (encontrados.length !== ids.length) {
          return NextResponse.json(
            { error: "Um ou mais serviços informados não foram encontrados." },
            { status: 400 }
          );
        }

        // Monta itens com precoUnitario (snapshot do preço no momento do orçamento)
        itensParaCriar = encontrados.map((s) => ({
          orcamentoId: "", // será preenchido após criar o orçamento
          servicoId: s.id,
          precoUnitario: s.preco, // já é Prisma.Decimal
          quantidade: 1,          // padrão; ajuste se for receber do frontend
        }));
      }
    }

    // ---- Transação: cria orçamento e itens
    const result = await prisma.$transaction(async (tx) => {
      const criado = await tx.orcamento.create({
        data: {
          userId: payload.id,
          clienteId,
          descricao,
          // Valor total: mantemos o informado pela UI; se quiser calcular pelo(s) serviço(s),
          // sobrescreva aqui com a soma de (precoUnitario * quantidade).
          valorTotal: new Prisma.Decimal(valorNum),
        },
      });

      if (itensParaCriar.length > 0) {
        await tx.orcamentoServico.createMany({
          data: itensParaCriar.map((it) => ({
            ...it,
            orcamentoId: criado.id,
          })),
          // skipDuplicates não é essencial aqui pois deduplicamos na entrada;
          // se adicionar @@unique([orcamentoId, servicoId]) no schema, pode manter:
          // skipDuplicates: true,
        });
      }

      // Retorna o orçamento com itens e dados úteis
      const completo = await tx.orcamento.findUnique({
        where: { id: criado.id },
        include: {
          cliente: { select: { id: true, nome: true } },
          itens: {
            include: {
              servico: { select: { id: true, nome: true, preco: true } },
            },
          },
        },
      });

      return completo!;
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
