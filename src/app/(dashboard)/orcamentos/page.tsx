"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import CardOrcamento, { Orcamento } from "./CardOrcamento";
import Link from "next/link";

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Campos do dialog "Novo Orçamento"
  const [cliente, setCliente] = useState("");
  const [valor, setValor] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [status, setStatus] = useState<string>("rascunho");

  const valorNumber = useMemo(() => {
    const v = Number(String(valor).replace(/\./g, "").replace(",", ".").trim());
    return Number.isFinite(v) ? v : 0;
  }, [valor]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!cliente.trim()) {
      alert("Cliente é obrigatório");
      return;
    }

    try {
      const res = await fetch("/api/orcamentos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: cliente.trim(),
          valor: valorNumber,
          data: data || new Date().toISOString().slice(0, 10),
          status: status || "rascunho",
        }),
      });

      if (!res.ok) {
        const erro = await res.json().catch(() => ({}));
        alert(erro?.error || "Erro ao criar orçamento");
        return;
      }

      // Reset
      setCliente("");
      setValor("");
      setData("");
      setStatus("rascunho");
      setOpen(false);
      fetchOrcamentos();
    } catch (err) {
      console.error("Erro ao criar orçamento:", err);
      alert("Erro ao criar orçamento");
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

        {/* Botão de adicionar orçamento via Dialog (opcional) */}
        <div className="mb-6 flex justify-end">
          <Link href="/orcamentos/novo">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </Link>
        </div>

        <ScrollArea className="h-[50vh] pr-2">
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
