// app/orcamentos/[id]/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Item = {
  id: string;
  servicoId: string | null;
  servicoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
};

type OrcamentoDetalhe = {
  id: string;
  cliente: {
    id: string | null;
    nome: string;
    email: string | null;
    telefone: string | null;
  };
  descricao: string | null; // -> usamos no "Objetivo"
  status: string;
  data: string; // ISO
  valorTotal: number;
  itens: Item[];
  totalCalculadoDosItens: number;
};

const COMPANY_CITY = "Joinville"; // ajuste conforme sua empresa

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const datePt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

export default function OrcamentoDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<OrcamentoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/orcamentos/${params.id}`, {
          credentials: "include",
          cache: "no-store",
        });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Falha ao carregar orçamento");
        if (mounted) setData(j);
      } catch (e: any) {
        if (mounted) setErr(e.message || "Erro ao carregar orçamento");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleServerPDF = useCallback(() => {
    const url = window.location.href;
    const pdfUrl = `/api/pdf?url=${encodeURIComponent(url)}`;
    window.open(pdfUrl, "_blank");
  }, []);

  const somaItens = useMemo(
    () => data?.itens.reduce((acc, i) => acc + i.subtotal, 0) ?? 0,
    [data?.itens]
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <p className="text-destructive">
          Erro: {err || "Dados não encontrados"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 print:p-0">
      {/* Barra superior (fora do "papel") */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="h-8 px-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="text-xs text-muted-foreground">
          ID: <span className="font-mono">{data.id}</span>
        </div>
      </div>

      {/* “Folha” da proposta */}
      <div className="bg-white shadow-sm ring-1 ring-border rounded-lg p-8 leading-relaxed text-[15px] text-foreground print:shadow-none print:ring-0 print:rounded-none">
        {/* Cabeçalho: cidade + data */}
        <div className="text-right text-sm text-muted-foreground">
          {COMPANY_CITY}, {datePt(data.data)}
        </div>

        {/* Saudação */}
        <div className="mt-8">
          <p className="mb-1">
            Ao(À) Sr(a).{" "}
            <span className="font-medium">{data.cliente.nome}</span>
          </p>
          <p className="text-muted-foreground text-sm">
            {data.cliente.email || "—"}{" "}
            {data.cliente.telefone ? `• ${data.cliente.telefone}` : ""}
          </p>
        </div>

        {/* Parágrafo introdutório */}
        <p className="mt-8">
          Atendendo à solicitação de envio da proposta, seguem abaixo os
          serviços contemplados, os objetivos do trabalho e o respectivo
          investimento para execução.
        </p>

        {/* Seção: Descrição */}
        <section className="mt-8">
          <h2 className="uppercase tracking-wider text-[12px] text-muted-foreground">
            Descrição
          </h2>
          <p className="mt-2">{data.descricao || "—"}</p>
        </section>

        {/* Seção: Serviços (lista a partir dos itens) */}
        <section className="mt-8">
          <h2 className="uppercase tracking-wider text-[12px] text-muted-foreground">
            Serviços que serão realizados
          </h2>
          {data.itens.length === 0 ? (
            <p className="mt-2 text-muted-foreground">
              Nenhum serviço anexado.
            </p>
          ) : (
            <ul className="mt-3 list-disc pl-5 space-y-1">
              {data.itens.map((it) => (
                <li key={it.id}>
                  {it.servicoNome}
                  {it.quantidade ? ` — ${it.quantidade}x` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Seção: Investimento (linhas + total) */}
        <section className="mt-8">
          <h2 className="uppercase tracking-wider text-[12px] text-muted-foreground">
            Investimento
          </h2>

          {data.itens.length > 0 && (
            <div className="mt-3 divide-y">
              {data.itens.map((it) => (
                <div
                  key={it.id}
                  className="py-2 flex items-baseline justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-medium">{it.servicoNome}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.quantidade} × {currency.format(it.precoUnitario)}
                    </div>
                  </div>
                  <div className="tabular-nums">
                    {currency.format(it.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t flex items-baseline justify-between">
            <div className="font-medium">Investimento Total</div>
            <div className="text-lg font-semibold tabular-nums">
              {currency.format(data.valorTotal)}
            </div>
          </div>

          {data.totalCalculadoDosItens !== data.valorTotal && (
            <p className="mt-2 text-xs text-muted-foreground">
              Observação: soma dos itens {currency.format(somaItens)} difere do
              valor total informado ({currency.format(data.valorTotal)}).
            </p>
          )}
        </section>

        {/* Seção: Observações */}
        <section className="mt-8">
          <h2 className="uppercase tracking-wider text-[12px] text-muted-foreground">
            Observações
          </h2>
          <ul className="mt-3 list-disc pl-5 space-y-1 text-[15px]">
            <li>
              Formas de pagamento e prazos podem ser ajustados conforme etapas
              do trabalho.
            </li>
            <li>Validade desta proposta: 15 dias a partir da data acima.</li>
          </ul>
        </section>

        {/* Agradecimento e assinatura */}
        <section className="mt-10">
          <p>
            Desde já, agradecemos a oportunidade e permanecemos à disposição
            para quaisquer esclarecimentos.
          </p>
        </section>

        {/* Rodapé técnico (status / referência) */}
        <div className="mt-10 pt-6 border-t text-xs text-muted-foreground">
          Criado por <span className="font-medium text-primary">EasyOrça</span>{" "}
          • Referência: <span className="font-mono">{data.id}</span>
        </div>
      </div>
      
      {/* Botões (apenas fora da impressão) */}
      <div className="mt-10 no-print flex flex-wrap gap-3 justify-center">
        <Button type="button" onClick={handlePrint}>
          Imprimir
        </Button>
        <Button type="button" onClick={handleServerPDF} variant="outline">
          Baixar PDF (servidor)
        </Button>
      </div>
    </div>
  );
}
