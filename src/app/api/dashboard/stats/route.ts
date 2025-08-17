// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma"; // use seu singleton
// Se você não tiver esse singleton, substitua por:
// import { PrismaClient } from "@prisma/client"; const prisma = new PrismaClient();

const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro";

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function startOfNextMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}
function startOfPrevMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);
}

function pctChange(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = jwt.verify(token, secretKey) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, companyId: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Períodos (mês atual e mês anterior)
    const now = new Date();
    const SOM = startOfMonth(now);
    const SONM = startOfNextMonth(now);
    const SOPM = startOfPrevMonth(now);

    // Filtro base: se tiver empresa, consolidamos por empresa; senão, por usuário
    const byCompany = !!user.companyId;

    const baseWhere = byCompany
      ? { user: { companyId: user.companyId! } }
      : { userId: user.id };

    const whereThisMonth = { ...baseWhere, createdAt: { gte: SOM, lt: SONM } };
    const wherePrevMonth = { ...baseWhere, createdAt: { gte: SOPM, lt: SOM } };

    // Consultas paralelas
    const [
      // Orçamentos criados
      budgetsThis,
      budgetsPrev,
      // Aprovados (para taxa de conversão)
      approvedThis,
      approvedPrev,
      // Somatório de valores
      sumThis,
      sumPrev,
      // Clientes (total atual e total antes do mês atual)
      clientsTotalNow,
      clientsTotalPrevEnd,
    ] = await Promise.all([
      prisma.orcamento.count({ where: whereThisMonth }),
      prisma.orcamento.count({ where: wherePrevMonth }),
      prisma.orcamento.count({ where: { ...whereThisMonth, status: "aprovado" } }),
      prisma.orcamento.count({ where: { ...wherePrevMonth, status: "aprovado" } }),
      prisma.orcamento.aggregate({
        where: whereThisMonth,
        _sum: { valorTotal: true },
      }),
      prisma.orcamento.aggregate({
        where: wherePrevMonth,
        _sum: { valorTotal: true },
      }),
      byCompany
        ? prisma.cliente.count({ where: { companyId: user.companyId! } })
        : Promise.resolve(0),
      byCompany
        ? prisma.cliente.count({
            where: { companyId: user.companyId!, createdAt: { lt: SOM } },
          })
        : Promise.resolve(0),
    ]);

    const totalThis = Number(sumThis._sum.valorTotal ?? 0);
    const totalPrev = Number(sumPrev._sum.valorTotal ?? 0);

    // Taxa de conversão (mês): aprovados / criados * 100
    const convThis = budgetsThis > 0 ? Math.round((approvedThis / budgetsThis) * 100) : 0;
    const convPrev = budgetsPrev > 0 ? Math.round((approvedPrev / budgetsPrev) * 100) : 0;
    // Diferença em pontos percentuais vs mês anterior
    const convDelta = convThis - convPrev;

    // Variações (%)
    const budgetsDeltaPct = pctChange(budgetsThis, budgetsPrev);
    const totalDeltaPct = pctChange(totalThis, totalPrev);
    // Para clientes: variação do estoque total (agora vs final do mês passado)
    const clientsDeltaPct = pctChange(clientsTotalNow, clientsTotalPrevEnd);

    return NextResponse.json({
      ok: true,
      period: { currentStart: SOM.toISOString(), nextStart: SONM.toISOString() },
      stats: {
        orcamentosCriados: { value: budgetsThis, changePct: budgetsDeltaPct, label: "Este mês" },
        clientesCadastrados: {
          value: clientsTotalNow,
          changePct: clientsDeltaPct,
          label: "Total cadastrado",
        },
        taxaConversao: { value: convThis, changePct: convDelta, label: "Orçamentos aceitos" },
        valorTotal: { value: totalThis, changePct: totalDeltaPct, label: "Em orçamentos" },
      },
    });
  } catch (err) {
    console.error("Erro /api/dashboard/stats:", err);
    return NextResponse.json({ error: "Falha ao calcular estatísticas" }, { status: 500 });
  }
}
