// app/api/ia/dashboard-summary/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY!;
const secretKey =
  process.env.JWT_SECRET ||
  process.env.NEXT_PUBLIC_JWT_SECRET ||
  "dev_fallback_inseguro";

// cache simples em memória
type CacheVal = { expiresAt: number; text: string };
const cache = new Map<string, CacheVal>();

type KPI = {
  budgets: number;
  approved: number;
  conversion: number;
  totalValue: number;
  avgTicket: number;
  newClients: number;
  servicesCatalog: number;
};
type TopItem = { name: string; qty?: number; count?: number; total: number };

function fmtBRL(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

function clamp3lines(s: string) {
  const lines = s.replace(/\r/g, "").trim().split("\n").filter(Boolean);
  const trimmed = lines.slice(0, 3).join("\n").trim();
  // hard cap de caracteres para não estourar layout
  return trimmed.slice(0, 360);
}

function localFallback(
  range: string,
  kpis: KPI,
  top: { services: TopItem[]; clients: TopItem[] }
) {
  const topServ = top.services?.[0]?.name;
  const topCli = top.clients?.[0]?.name;
  const partes: string[] = [];
  partes.push(
    `No período (${range}), foram ${kpis.budgets} orçamentos e ${kpis.approved} aprovados (${kpis.conversion}%).`
  );
  partes.push(
    `Faturamento acumulado de ${fmtBRL(
      kpis.totalValue
    )} e ticket médio em ${fmtBRL(kpis.avgTicket)}.`
  );
  if (topServ || topCli) {
    const extra = [
      topServ ? `serviço em destaque: ${topServ}` : null,
      topCli ? `cliente em destaque: ${topCli}` : null,
    ]
      .filter(Boolean)
      .join("; ");
    if (extra) partes.push(extra + ".");
  }
  return clamp3lines(partes.join(" "));
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token)
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const payload = jwt.verify(token, secretKey) as {
      id: string;
      companyId?: string;
    };
    // recebemos o overview já pronto do client
    const body = await req.json().catch(() => ({}));
    const range: string = body?.period?.range ?? "this-month";
    const kpis: KPI = body?.kpis ?? {};
    const top = body?.top ?? { services: [], clients: [] };

    if (!kpis || typeof kpis.totalValue !== "number") {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const companyKey = String(payload?.companyId ?? "by-user:" + payload?.id);
    const cacheKey = `${companyKey}:${range}:${kpis.totalValue}:${kpis.conversion}:${kpis.approved}:${kpis.avgTicket}:${kpis.budgets}`;

    // cache 10 minutos
    const hit = cache.get(cacheKey);
    const now = Date.now();
    if (hit && hit.expiresAt > now) {
      return NextResponse.json({ summary: hit.text, cached: true });
    }

    // prompt enxuto para 2–3 frases
    const system = [
      "Você é um analista de negócios. Escreva um RESUMO curto em PT-BR sobre o desempenho da empresa no período.",
      "REGRAS:",
      "- 2 a 3 frases (no máximo 3 linhas).",
      "- Tom profissional e direto; sem floreios.",
      "- Pode citar valores e % que vierem no input (formato BRL/percentual).",
      "- Destaque brevemente 1 serviço e/ou 1 cliente quando houver.",
      "- Sem bullets; apenas texto corrido.",
    ].join("\n");

    const payloadForAi = {
      periodo: range,
      kpis: {
        orcamentos: kpis.budgets,
        aprovados: kpis.approved,
        conversao_pct: kpis.conversion,
        total_brl: fmtBRL(kpis.totalValue),
        ticket_medio_brl: fmtBRL(kpis.avgTicket),
        novos_clientes: kpis.newClients,
        catalogo_servicos: kpis.servicesCatalog,
      },
      destaques: {
        top_servicos: top.services
          ?.slice(0, 2)
          ?.map((s: TopItem) => ({ nome: s.name, total_brl: fmtBRL(s.total) })),
        top_clientes: top.clients
          ?.slice(0, 2)
          ?.map((c: TopItem) => ({ nome: c.name, total_brl: fmtBRL(c.total) })),
      },
    };

    let summary = "";
    if (API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "text/plain" as any },
        });
        const res = await model.generateContent([
          { text: system },
          { text: "Dados agregados do período (JSON):" },
          { text: JSON.stringify(payloadForAi) },
          { text: "Escreva o resumo agora, seguindo as regras." },
        ] as any);
        summary = clamp3lines(res.response.text() || "");
      } catch (e: any) {
        // quota/429 ou qualquer erro → fallback local
        summary = localFallback(range, kpis, top);
      }
    } else {
      summary = localFallback(range, kpis, top);
    }

    // salva em cache
    cache.set(cacheKey, {
      expiresAt: now + 10 * 60 * 1000,
      data: undefined as any,
      text: summary,
    } as any);

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("[IA/dashboard-summary] ERRO:", err);
    return NextResponse.json(
      { error: "Falha ao gerar resumo" },
      { status: 500 }
    );
  }
}
