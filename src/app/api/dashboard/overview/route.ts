// app/api/dashboard/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
// Se não tiver singleton, use: import { PrismaClient } from "@prisma/client"; const prisma = new PrismaClient();

const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro";

// Helpers de período
function startOfMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0); }
function endOfMonth(d = new Date()) { return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0); }
function startOfQuarter(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q, 1, 0, 0, 0, 0);
}
function endOfQuarter(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3) * 3;
  return new Date(d.getFullYear(), q + 3, 1, 0, 0, 0, 0);
}
function startOfYear(d = new Date()) { return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0); }
function endOfYear(d = new Date()) { return new Date(d.getFullYear() + 1, 0, 1, 0, 0, 0, 0); }
function daysBetween(a: Date, b: Date) {
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}
function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function dateKey(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const payload = jwt.verify(token, secretKey) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, companyId: true },
    });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // === Range ===
    const range = req.nextUrl.searchParams.get("range") || "this-month";
    const now = new Date();
    let start: Date, end: Date;

    switch (range) {
      case "last-30d":
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        start = addDays(end, -30);
        break;
      case "this-quarter":
        start = startOfQuarter(now);
        end = endOfQuarter(now);
        break;
      case "this-year":
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case "this-month":
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }

    const byCompany = !!user.companyId;
    const baseWhere = byCompany ? { user: { companyId: user.companyId! } } : { userId: user.id };
    const wherePeriod = { ...baseWhere, createdAt: { gte: start, lt: end } };

    // === Consultas paralelas ===
    const [
      budgetsCount,
      approvedCount,
      valueAgg,
      clientesNovos, // novos no período
      servicosCount,
      recentBudgets,
      // Para top clientes e serviços, e séries
      budgetsInPeriod,
      itemsInPeriod,
    ] = await Promise.all([
      prisma.orcamento.count({ where: wherePeriod }),
      prisma.orcamento.count({ where: { ...wherePeriod, status: "aprovado" } }),
      prisma.orcamento.aggregate({ where: wherePeriod, _sum: { valorTotal: true }, _avg: { valorTotal: true } }),
      byCompany
        ? prisma.cliente.count({ where: { companyId: user.companyId!, createdAt: { gte: start, lt: end } } })
        : Promise.resolve(0),
      byCompany
        ? prisma.servico.count({ where: { companyId: user.companyId! } })
        : Promise.resolve(0),
      prisma.orcamento.findMany({
        where: wherePeriod,
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          status: true,
          valorTotal: true,
          cliente: { select: { id: true, nome: true } },
        },
      }),
      prisma.orcamento.findMany({
        where: wherePeriod,
        select: {
          id: true, createdAt: true, status: true, valorTotal: true,
          cliente: { select: { nome: true } },
        },
      }),
      prisma.orcamentoServico.findMany({
        where: { orcamento: wherePeriod },
        select: {
          quantidade: true,
          precoUnitario: true,
          servico: { select: { nome: true } },
          orcamento: { select: { createdAt: true } },
        },
      }),
    ]);

    const totalValor = Number(valueAgg._sum.valorTotal ?? 0);
    const avgTicket = Number(valueAgg._avg.valorTotal ?? 0);
    const conversion = budgetsCount > 0 ? Math.round((approvedCount / budgetsCount) * 100) : 0;

    // === Séries diárias ou mensais conforme o range ===
    const days = daysBetween(start, end);
    const groupDaily = days <= 92; // até ~3 meses plotar por dia; senão por mês

    // Revenue por dia/mês
    const revenueMap = new Map<string, number>();
    // Conversão por mês
    const convMap = new Map<string, { aprov: number; total: number }>();

    for (const b of budgetsInPeriod) {
      const d = new Date(b.createdAt);
      const key = groupDaily ? dateKey(d) : monthKey(d);
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + Number(b.valorTotal ?? 0));

      const mk = monthKey(d);
      const curr = convMap.get(mk) ?? { aprov: 0, total: 0 };
      curr.total += 1;
      if (b.status === "aprovado") curr.aprov += 1;
      convMap.set(mk, curr);
    }

    const seriesRevenue = [];
    if (groupDaily) {
      for (let i = 0; i < days; i++) {
        const d = addDays(start, i);
        const key = dateKey(d);
        seriesRevenue.push({ x: key, total: Math.round(revenueMap.get(key) ?? 0) });
      }
    } else {
      // Meses dentro do range
      const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
      while (cursor < end) {
        const key = monthKey(cursor);
        seriesRevenue.push({ x: key, total: Math.round(revenueMap.get(key) ?? 0) });
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    // Conversão por mês
    const seriesConversion = Array.from(convMap.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([mk, v]) => ({ x: mk, conversion: v.total > 0 ? Math.round((v.aprov / v.total) * 100) : 0 }));

    // Top serviços
    const serviceAgg = new Map<string, { qty: number; total: number }>();
    for (const it of itemsInPeriod) {
      const name = it.servico.nome;
      const total = Number(it.precoUnitario) * it.quantidade;
      const curr = serviceAgg.get(name) ?? { qty: 0, total: 0 };
      curr.qty += it.quantidade;
      curr.total += total;
      serviceAgg.set(name, curr);
    }
    const topServices = Array.from(serviceAgg.entries())
      .map(([name, v]) => ({ name, qty: v.qty, total: Math.round(v.total) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // Top clientes
    const clientAgg = new Map<string, { count: number; total: number }>();
    for (const b of budgetsInPeriod) {
      const name = b.cliente?.nome ?? "—";
      const curr = clientAgg.get(name) ?? { count: 0, total: 0 };
      curr.count += 1;
      curr.total += Number(b.valorTotal ?? 0);
      clientAgg.set(name, curr);
    }
    const topClients = Array.from(clientAgg.entries())
      .map(([name, v]) => ({ name, count: v.count, total: Math.round(v.total) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    return NextResponse.json({
      ok: true,
      period: { start: start.toISOString(), end: end.toISOString(), range },
      kpis: {
        budgets: budgetsCount,
        approved: approvedCount,
        conversion,            // %
        totalValue: totalValor, // BRL
        avgTicket: Math.round(avgTicket || 0),
        newClients: clientesNovos,
        servicesCatalog: servicosCount,
      },
      series: {
        revenue: seriesRevenue,          // [{x: "2025-08-01"|"2025-08", total: number}]
        conversion: seriesConversion,    // [{x: "2025-08", conversion: %}]
      },
      top: {
        services: topServices,           // [{name, qty, total}]
        clients: topClients,             // [{name, count, total}]
      },
      recentBudgets: recentBudgets.map(r => ({
        id: r.id,
        createdAt: r.createdAt,
        status: r.status,
        valorTotal: Number(r.valorTotal ?? 0),
        clienteNome: r.cliente?.nome ?? "—",
      })),
    });
  } catch (err) {
    console.error("Erro /api/dashboard/overview:", err);
    return NextResponse.json({ error: "Falha ao montar overview" }, { status: 500 });
  }
}
