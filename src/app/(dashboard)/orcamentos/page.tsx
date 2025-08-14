// app/orcamentos/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usePremium } from "@/components/PremiumProvider";

// ✅ importe do caminho correto + tipo Orcamento
import CardOrcamento, { Orcamento } from "./CardOrcamento";

export default function OrcamentosPage() {
  // ✅ tipagem correta
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState<string | null>(null);
  const { isPremium, loading: premiumLoading } = usePremium();
  const MAX_ORCAMENTOS = isPremium ? 100 : 20;

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  async function fetchOrcamentos() {
    try {
      setLoading(true);
      setErroMsg(null);
      const res = await fetch("/api/orcamentos", { credentials: "include" });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();

      // ✅ normalize a resposta da API para o shape esperado pelo componente
      const normalizados: Orcamento[] = data.map((s: any) => ({
        id: s.id,
        cliente: s.cliente?.nome ?? s.cliente ?? "—",
        valor: Number(
          s.valorTotal ?? s.valor ?? s.preco ?? 0 // cobre variações de backend
        ),
        data: s.createdAt ?? s.data ?? new Date().toISOString(),
        status: (s.status as Orcamento["status"]) ?? "rascunho",
        descricao: s.descricao ?? null,
      }));

      setOrcamentos(normalizados);
    } catch (err: any) {
      console.error("Erro ao carregar orçamentos:", err);
      setErroMsg(err?.message || "Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader title="Orçamentos" />

      <main className="p-6 max-w-4xl">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe e gerencie seus orçamentos.
          </p>
        </section>

        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link href="/orcamentos/novo">
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lista de Orçamentos</h2>
            <p className="text-muted-foreground text-sm">
              {loading ? "Carregando..." : `${orcamentos.length} orçamento(s)`} (restam{" "}
              {MAX_ORCAMENTOS - orcamentos.length})
            </p>
          </CardHeader>

          <CardContent className="p-4">
            <ScrollArea className="h-[50vh] pr-2">
              {loading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : erroMsg ? (
                <p className="text-sm text-red-600">{erroMsg}</p>
              ) : orcamentos.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum orçamento encontrado.
                </p>
              ) : (
                <div className="grid gap-4">
                  {orcamentos.map((orcamento) => (
                    <CardOrcamento
                      key={orcamento.id}
                      orcamento={orcamento}
                      onUpdate={(s) =>
                        setOrcamentos((old) => old.map((x) => (x.id === s.id ? s : x)))
                      }
                      onDelete={(id) =>
                        setOrcamentos((old) => old.filter((x) => x.id !== id))
                      }
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
