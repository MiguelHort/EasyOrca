export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const API_KEY = process.env.GEMINI_API_KEY!;
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || "testeSIH";

// ===== helpers =====
const STOP = new Set([
  "de","da","do","das","dos","para","pra","por","e","em","a","o","as","os",
  "no","na","nos","nas","com","sem","ao","à","às","aos","depois","antes","após","pós"
]);

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // acentos
    .replace(/[^a-z0-9\s-]/g, " ")   // só letras/numeros
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(name: string) {
  return normalize(name)
    .split(" ")
    .filter(w => w.length >= 3 && !STOP.has(w));
}

function median(nums: number[]) {
  if (!nums.length) return 0;
  const a = nums.slice().sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function safeJsonArray(text: string) {
  const m = text.match(/\[[\s\S]*\]/);
  const raw = m ? m[0] : text;
  return JSON.parse(raw);
}

// ===== rota =====
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const payload = jwt.verify(token, secretKey) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.json({ error: "Usuário sem empresa vinculada" }, { status: 403 });
    }

    const { max = 5 } = (await req.json().catch(() => ({}))) as { max?: number };

    // === 1) Catálogo atual ===
    const catalog = await prisma.servico.findMany({
      where: { companyId: user.companyId },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, preco: true },
      take: 300,
    });

    const names = catalog.map(c => c.nome);
    const lowerSet = new Set(names.map(n => normalize(n)));
    const prices = catalog.map(c => Number(c.preco)).filter(n => Number.isFinite(n) && n >= 0);
    const globalMed = median(prices) || 100;

    // === 2) Extrair categorias (palavras-chave) a partir dos nomes existentes ===
    // mapa keyword -> { exemplos: string[], precos: number[] }
    const catMap = new Map<string, { exemplos: string[]; precos: number[] }>();

    for (const c of catalog) {
      const toks = tokens(c.nome);
      const uniq = Array.from(new Set(toks)).slice(0, 3); // no máximo 3 palavras relevantes por serviço
      for (const t of uniq) {
        const entry = catMap.get(t) ?? { exemplos: [], precos: [] };
        if (entry.exemplos.length < 4) entry.exemplos.push(c.nome); // poucos exemplos por categoria
        if (Number.isFinite(Number(c.preco))) entry.precos.push(Number(c.preco));
        catMap.set(t, entry);
      }
    }

    // pegar top 8 keywords mais frequentes
    const catsSorted = Array.from(catMap.entries())
      .sort((a, b) => b[1].exemplos.length - a[1].exemplos.length)
      .slice(0, 8)
      .map(([keyword, data]) => ({
        keyword,
        exemplos: data.exemplos,
        precoMediano: median(data.precos) || globalMed,
      }));

    // se não há categorias (catálogo vazio), devolve vazio (ou você pode fazer um fallback de “serviços genéricos”)
    if (!catsSorted.length) {
      return NextResponse.json({ suggestions: [] });
    }

    // === 3) Montar prompt estruturado e exigir JSON ===
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      // força JSON na resposta
      generationConfig: { responseMimeType: "application/json" as any },
    });

    const N = Math.min(Math.max(1, max), 8);
    const system = [
      "Você é um assistente que expande um catálogo de serviços EXISTENTE.",
      "Somente sugira serviços que sejam SEMELHANTES ou COMPLEMENTARES às CATEGORIAS fornecidas.",
      "NÃO invente uma área totalmente nova que não esteja relacionada.",
      `Retorne EXATAMENTE ${N} itens (ou menos se não houver correspondência), no formato JSON:`,
      `[{"nome":"...","precoSugerido":123.45,"motivo":"...","similarA":"<um exemplo da categoria>"}]`,
      "Regras:",
      "- 'nome' curto (<= 40 chars), PT-BR, não duplicar nomes existentes.",
      "- 'precoSugerido' number (BRL). Se em dúvida, use a mediana da categoria.",
      "- 'motivo' até 8 palavras (ex.: “complementa manutenção elétrica”).",
      "- 'similarA' deve ser um dos exemplos listados na categoria correspondente.",
      "IMPORTANTE: Responda APENAS com o array JSON (sem comentários ou texto solto).",
    ].join("\n");

    const userMsg = {
      categorias: catsSorted, // [{keyword, exemplos, precoMediano}]
      jaCadastrados: names,   // para o modelo entender duplicatas
    };

    let out: any[] = [];
    try {
      const res = await model.generateContent([
        { text: system },
        { text: "CATEGORIAS E EXEMPLOS:" },
        { text: JSON.stringify(userMsg) },
      ] as any);

      const txt = res.response.text();
      // como geramos com responseMimeType JSON, em tese já vem JSON; o safeJsonArray é um guarda-chuva
      out = Array.isArray(JSON.parse(txt)) ? JSON.parse(txt) : safeJsonArray(txt);
    } catch (e) {
      // falha de LLM -> devolve nada (ou você pode gerar um fallback “genérico” com base nas categorias)
      out = [];
    }

    // === 4) Saneamento e verificação contra categorias ===
    // cria um set de keywords para testar semelhança simples no servidor
    const keySet = new Set(catsSorted.map(c => c.keyword));

    const seen = new Set<string>();
    const cleaned = out
      .filter(x => x && typeof x.nome === "string" && x.nome.trim())
      .map(x => ({
        nome: String(x.nome).trim().slice(0, 60),
        precoSugerido: Number(x.precoSugerido),
        motivo: typeof x.motivo === "string" ? x.motivo.trim().slice(0, 60) : "",
        similarA: typeof x.similarA === "string" ? x.similarA.trim().slice(0, 80) : "",
      }))
      // não duplicar o que já existe (case-insensitive normalizado)
      .filter(x => !lowerSet.has(normalize(x.nome)))
      // garantir número válido; se não, usar mediana da CATEGORIA correspondente, senão a global
      .map(x => {
        // tenta inferir a categoria pela 'similarA' ou pelo nome (tokens)
        const toks = tokens(x.nome);
        const kwHit =
          catsSorted.find(c => c.exemplos.some(ex => normalize(ex) === normalize(x.similarA)))?.keyword ||
          toks.find(t => keySet.has(t));
        const catMed = catsSorted.find(c => c.keyword === kwHit)?.precoMediano ?? globalMed;
        return {
          ...x,
          precoSugerido:
            Number.isFinite(x.precoSugerido) && x.precoSugerido >= 0
              ? x.precoSugerido
              : Math.round(catMed),
        };
      })
      // tira duplicatas dentro do próprio retorno
      .filter(x => (seen.has(normalize(x.nome)) ? false : seen.add(normalize(x.nome))))
      // garante relacionamento mínimo com alguma categoria (via similarA ou token)
      .filter(x => {
        const toks = tokens(x.nome);
        return (
          (x.similarA && catalog.some(c => normalize(c.nome) === normalize(x.similarA))) ||
          toks.some(t => keySet.has(t))
        );
      })
      .slice(0, N);

    return NextResponse.json({ suggestions: cleaned });
  } catch (err: any) {
    console.error("[IA/sugerir-servicos] ERRO:", err);
    return NextResponse.json({ error: err?.message || "Erro ao sugerir serviços" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, howTo: "POST { max?: number }" });
}
