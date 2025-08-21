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
  descricao: string | null;
  status: string;
  data: string; // ISO
  valorTotal: number;
  itens: Item[];
  totalCalculadoDosItens: number;
};

const COMPANY_CITY = "Joinville";

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

// Paleta rápida para chips de status
const statusColor: Record<string, string> = {
  PENDENTE:
    "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30",
  APROVADO:
    "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30",
  REPROVADO:
    "bg-rose-100 text-rose-800 ring-1 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30",
  ENVIADO:
    "bg-sky-100 text-sky-800 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/30",
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
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-36 bg-muted rounded" />
          <div className="h-56 bg-muted rounded" />
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
        <p className="text-destructive">Erro: {err || "Dados não encontrados"}</p>
      </div>
    );
  }

  // status chip
  const status = (data.status || "").toUpperCase();
  const statusCls =
    statusColor[status] ||
    "bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-300 dark:ring-zinc-400/30";

  return (
    <div className="max-w-4xl mx-auto p-6 print:p-0">
      {/* Barra superior (fora do papel) */}
      <div className="flex items-center justify-between mb-4 print:hidden">
        <Button variant="ghost" onClick={() => router.back()} className="h-8 px-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="text-xs text-muted-foreground">
          ID: <span className="font-mono">{data.id}</span>
        </div>
      </div>

      {/* Banner colorido */}
      <div className="mb-4 rounded-xl overflow-hidden shadow-sm ring-1 ring-border">
        <div className="bg-gradient-to-r from-blue-800 to-blue-400 p-[1px]">
          <div className="bg-background/80 dark:bg-background/60 backdrop-blur-sm p-4 md:p-5 rounded-[11px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                  Proposta / Orçamento
                </h1>
                <p className="text-sm text-muted-foreground">
                  {COMPANY_CITY}, {datePt(data.data)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusCls}`}>
                  {status || "—"}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary ring-1 ring-primary/20">
                  Total: {currency.format(data.valorTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* “Folha” da proposta */}
      <div className="bg-primary-foreground shadow-sm ring-1 ring-border rounded-2xl p-0 overflow-hidden">
        {/* Faixa superior decorativa (impressão oculta) */}
        <div className="h-2 bg-gradient-to-r from-blue-800 to-blue-400 " />

        {/* Conteúdo da folha */}
        <div className="p-6 md:p-8 leading-relaxed text-[15px] text-foreground">
          {/* Cabeçalho compacto dentro do papel (visível na impressão) */}
          <div className="text-right text-sm text-muted-foreground md:hidden print:block">
            {COMPANY_CITY}, {datePt(data.data)}
          </div>

          {/* Grid: Dados do cliente (color bloc) + texto de introdução */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Cartão de Cliente */}
            <aside className="sm:col-span-1">
              <div className="rounded-xl ring-1 ring-blue-200/60 dark:ring-blue-400/20 bg-blue-50/60 dark:bg-blue-500/10 p-4">
                <h3 className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300 font-medium">
                  Cliente
                </h3>
                <div className="mt-2">
                  <div className="font-medium">{data.cliente.nome}</div>
                  <div className="text-sm text-muted-foreground break-words">
                    {data.cliente.email || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {data.cliente.telefone || "—"}
                  </div>
                </div>
                <div className="mt-3 h-px bg-gradient-to-r from-indigo-300/70 via-transparent to-transparent" />
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div>
                    Referência: <span className="font-medium">{data.id}</span>
                  </div>
                  <div>
                    Emissão: <span className="font-medium">{datePt(data.data)}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Introdução */}
            <div className="sm:col-span-2">
              <div className="rounded-xl h-full ring-1 ring-sky-200/60 dark:ring-sky-400/20 bg-sky-50/60 dark:bg-sky-500/10 p-4">
                <h3 className="text-xs uppercase tracking-wider text-sky-700 dark:text-sky-300 font-medium">
                  Apresentação
                </h3>
                <p className="mt-2">
                  Atendendo à solicitação de envio da proposta, seguem abaixo os serviços
                  contemplados, os objetivos do trabalho e o respectivo investimento para
                  execução.
                </p>
              </div>
            </div>
          </div>

          {/* Seção: Descrição */}
          <section className="mt-8">
            <h2 className="uppercase tracking-wider text-[12px] text-blue-700 dark:text-blue-300">
              Descrição
            </h2>
            <div className="mt-2 rounded-lg border border-blue-200/60 dark:border-blue-400/20 bg-blue-50/50 dark:bg-blue-500/10 p-4">
              <p>{data.descricao || "—"}</p>
            </div>
          </section>

          {/* Seção: Serviços */}
          <section className="mt-8">
            <h2 className="uppercase tracking-wider text-[12px] text-blue-700 dark:text-blue-300">
              Serviços que serão realizados
            </h2>

            {data.itens.length === 0 ? (
              <p className="mt-2 text-muted-foreground">Nenhum serviço anexado.</p>
            ) : (
              <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                {data.itens.map((it) => (
                  <li
                    key={it.id}
                    className="rounded-md px-3 py-2 bg-blue-50/60 dark:bg-blue-500/10 ring-1 ring-blue-200/60 dark:ring-blue-400/20"
                  >
                    <div className="font-medium">{it.servicoNome}</div>
                    <div className="text-xs text-muted-foreground">
                      {it.quantidade ? `${it.quantidade} × ${currency.format(it.precoUnitario)}` : "—"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Seção: Investimento */}
          <section className="mt-8">
            <h2 className="uppercase tracking-wider text-[12px] text-blue-700 dark:text-blue-300">
              Investimento
            </h2>

            {data.itens.length > 0 && (
              <div className="mt-3 divide-y rounded-lg border border-indigo-200/60 dark:border-indigo-400/20 overflow-hidden">
                {data.itens.map((it, idx) => (
                  <div
                    key={it.id}
                    className={`py-3 px-4 flex items-baseline justify-between gap-4 bg-white/60 dark:bg-zinc-900/40 ${
                      idx % 2 === 0 ? "bg-indigo-50/40 dark:bg-indigo-500/5" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium">{it.servicoNome}</div>
                      <div className="text-xs text-muted-foreground">
                        {it.quantidade} × {currency.format(it.precoUnitario)}
                      </div>
                    </div>
                    <div className="tabular-nums font-semibold">
                      {currency.format(it.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex items-baseline justify-between">
              <div className="font-medium">Investimento Total</div>
              <div className="text-lg font-semibold tabular-nums text-primary">
                {currency.format(data.valorTotal)}
              </div>
            </div>

            {data.totalCalculadoDosItens !== data.valorTotal && (
              <p className="mt-2 text-xs text-muted-foreground">
                Observação: soma dos itens {currency.format(somaItens)} difere do valor total
                informado ({currency.format(data.valorTotal)}).
              </p>
            )}
          </section>

          {/* Observações */}
          <section className="mt-8">
            <h2 className="uppercase tracking-wider text-[12px] text-rose-700 dark:text-rose-300">
              Observações
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-1 text-[15px]">
              <li>Formas de pagamento e prazos podem ser ajustados conforme etapas do trabalho.</li>
              <li>Validade desta proposta: 15 dias a partir da data acima.</li>
            </ul>
          </section>

          {/* Agradecimento */}
          <section className="mt-10">
            <div className="rounded-xl ring-1 ring-blue-200/60 dark:ring-blue-400/20 bg-blue-50/60 dark:bg-blue-500/10 p-4">
              <p>
                Desde já, agradecemos a oportunidade e permanecemos à disposição para quaisquer
                esclarecimentos.
              </p>
            </div>
          </section>

          {/* Rodapé */}
          <div className="mt-10 pt-6 border-t text-xs text-muted-foreground">
            Criado por <span className="font-medium text-primary">EasyOrça</span> • Referência:{" "}
            <span className="font-medium">{data.id}</span>
          </div>
        </div>
      </div>

      {/* Botões (apenas fora da impressão) */}
      <div className="mt-6 no-print flex flex-wrap gap-3 justify-center ">
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
