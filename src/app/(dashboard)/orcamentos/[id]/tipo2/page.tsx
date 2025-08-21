// app/orcamentos/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const dateFmt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4">
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
      <div className="max-w-3xl mx-auto p-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <p className="text-destructive">
          Erro: {err || "Dados não encontrados"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="text-sm text-muted-foreground">ID: {data.id}</div>
      </div>

      <h1 className="text-2xl font-bold">Detalhes do Orçamento</h1>

      <Card>
        <CardContent className="p-4 grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-medium">{data.cliente.nome}</p>
            <p className="text-sm text-muted-foreground">
              {data.cliente.email || "—"}{" "}
              {data.cliente.telefone ? `• ${data.cliente.telefone}` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Data • Status</p>
            <p className="font-medium">
              {dateFmt(data.data)} <span className="mx-2">•</span>{" "}
              <span className="capitalize">{data.status}</span>
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground">Descrição</p>
            <p className="font-medium">{data.descricao || "—"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground">Valor Total</p>
            <p className="text-xl font-semibold">
              {currency.format(data.valorTotal)}
            </p>
            {data.totalCalculadoDosItens !== data.valorTotal && (
              <p className="text-xs text-muted-foreground mt-1">
                Observação: soma dos itens{" "}
                {currency.format(data.totalCalculadoDosItens)} difere do
                valorTotal.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-lg font-semibold mb-2">Serviços do Orçamento</h2>

        {data.itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum serviço anexado.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="p-3">Serviço</th>
                  <th className="p-3">Qtd</th>
                  <th className="p-3">Preço Unit.</th>
                  <th className="p-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {data.itens.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="p-3 font-medium">{it.servicoNome}</td>
                    <td className="p-3">{it.quantidade}</td>
                    <td className="p-3">{currency.format(it.precoUnitario)}</td>
                    <td className="p-3 font-medium">
                      {currency.format(it.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="p-3" colSpan={3}>
                    Total
                  </td>
                  <td className="p-3">
                    {currency.format(
                      data.itens.reduce((acc, i) => acc + i.subtotal, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
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