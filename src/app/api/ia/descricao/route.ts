import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getGeminiModel } from "@/lib/ai/gemini";

const BodySchema = z.object({
  clienteNome: z.string().optional(),
  servicos: z
    .array(
      z.object({
        id: z.string(),
        nome: z.string(),
        preco: z.number().nonnegative().default(0),
      })
    )
    .default([]),
  valorTotal: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { clienteNome, servicos, valorTotal } = BodySchema.parse(json);

    const lista = servicos
      .slice(0, 50) // guardrail simples contra prompts gigantes
      .map(
        (s, i) =>
          `${i + 1}. ${s.nome}${
            s.preco
              ? ` — ${s.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}`
              : ""
          }`
      )
      .join("\n");

    const prompt = [
      "Você é um assistente que escreve descrições objetivas de orçamentos.",
      "Escreva um texto muito curto, em PT-BR, com no máximo 3 linhas.",
      "O tom deve ser profissional, claro e direto.",
      "Inclua apenas um resumo do escopo e dos serviços principais, sem valores.",
      "Não use bullets, nem enumerações, apenas um parágrafo corrido.",
      clienteNome ? `Cliente: ${clienteNome}` : "",
      valorTotal
        ? `Valor total estimado (não citar no texto): ${valorTotal}`
        : "",
      "Serviços selecionados:",
      lista ||
        "(nenhum serviço cadastrado — descreva de forma genérica e peça validação do cliente).",
    ]
      .filter(Boolean)
      .join("\n");

    const model = getGeminiModel(); // gemini-1.5-flash
    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Não foi possível gerar a descrição." },
        { status: 502 }
      );
    }

    // (Opcional) Limpeza/normalização básica
    const descricao = text.replace(/\n{3,}/g, "\n\n");

    return NextResponse.json({ descricao });
  } catch (err: any) {
    console.error("[IA.Descricao] ERRO:", err);
    const msg = err?.message || "Erro ao gerar a descrição";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
