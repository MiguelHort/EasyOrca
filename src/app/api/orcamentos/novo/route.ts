import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client"; // <- pega o namespace Prisma (Decimal)
import { prisma } from "@/lib/prisma";   // <- use o singleton

export const runtime = "nodejs";         // <- garanta Node.js runtime (não Edge)
// export const dynamic = "force-dynamic"; // (opcional) evita cache de rota

const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    // Carrega user com o necessário para validações
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, companyId: true, isPremium: true },
    });
    if (!user?.companyId) {
      return NextResponse.json({ error: "Usuário sem empresa vinculada" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    let { clienteId, descricao = "", valorTotal, servicoIds = [] } = body || {};

    // valida clienteId
    if (!clienteId || typeof clienteId !== "string") {
      return NextResponse.json({ error: "Cliente não informado." }, { status: 422 });
    }

    // garante que cliente pertence à empresa
    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, companyId: user.companyId },
      select: { id: true },
    });
    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado para esta empresa." },
        { status: 404 }
      );
    }

    // 🔹 LIMITADOR DE ORÇAMENTOS POR EMPRESA
    // Limite por empresa: 30 (normal) ou 100 (premium)
    const limite = user.isPremium ? 100 : 15;

    // Contamos orçamentos da empresa pelo relacionamento via cliente
    // (sem exigir companyId direto em orcamento)
    const totalOrcamentos = await prisma.orcamento.count({
      where: {
        cliente: { companyId: user.companyId },
      },
    });

    if (totalOrcamentos >= limite) {
      return NextResponse.json(
        { error: `Limite de ${limite} orçamentos atingido para esta empresa.` },
        { status: 403 }
      );
    }
    // 🔹 FIM DO LIMITADOR

    // normaliza serviços
    const servicoIdList: string[] = Array.isArray(servicoIds)
      ? Array.from(
          new Set(
            servicoIds
              .filter((s: unknown) => typeof s === "string")
              .map((s: string) => s.trim())
              .filter(Boolean)
          )
        )
      : [];

    // busca serviços (se houver)
    let encontrados: { id: string; preco: Prisma.Decimal }[] = [];
    if (servicoIdList.length > 0) {
      encontrados = await prisma.servico.findMany({
        where: { id: { in: servicoIdList }, companyId: user.companyId },
        select: { id: true, preco: true },
      });

      if (encontrados.length !== servicoIdList.length) {
        return NextResponse.json(
          { error: "Um ou mais serviços não pertencem à sua empresa." },
          { status: 400 }
        );
      }
    }

    // calcula total se não veio
    const somaServicos = encontrados.reduce((acc, s) => acc + Number(s.preco), 0);

    let totalNum: number | null = null;
    if (typeof valorTotal === "number") totalNum = valorTotal;
    else if (typeof valorTotal === "string") totalNum = Number(valorTotal);
    else if (servicoIdList.length > 0) totalNum = somaServicos;

    if (!Number.isFinite(totalNum) || (totalNum ?? 0) <= 0) {
      return NextResponse.json(
        { error: "Valor total inválido. Informe o valor ou selecione serviços com preço." },
        { status: 422 }
      );
    }

    // Transação: cria orçamento e itens
    const criado = await prisma.$transaction(async (tx) => {
      const orc = await tx.orcamento.create({
        data: {
          userId: payload.id,
          clienteId,
          descricao,
          valorTotal: new Prisma.Decimal(totalNum as number), // <- use Prisma.Decimal
          // status usa default "enviado"
        },
      });

      if (encontrados.length > 0) {
        await tx.orcamentoServico.createMany({
          data: encontrados.map((s) => ({
            orcamentoId: orc.id,
            servicoId: s.id,
            precoUnitario: s.preco, // já é Decimal
            quantidade: 1,
          })),
        });
      }

      return tx.orcamento.findUnique({
        where: { id: orc.id },
        include: {
          cliente: { select: { id: true, nome: true } },
          itens: {
            include: { servico: { select: { id: true, nome: true, preco: true } } },
          },
        },
      });
    });

    return NextResponse.json(criado, { status: 201 });
  } catch (err: any) {
    if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
    }
    console.error("[POST /api/orcamentos/novo] Erro:", err);
    return NextResponse.json({ error: "Erro ao criar orçamento" }, { status: 500 });
  }
}
