"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import CardOrcamento, { Orcamento } from "./CardOrcamento";
import Link from "next/link";

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

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
      setOrcamentos(data);
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
          <Link href="/orcamentos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </Link>
        </div>

        <ScrollArea className="pr-2">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
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
              {orcamentos.map((o) => (
                <CardOrcamento key={o.id} orcamento={o} />
              ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </>
  );
}
