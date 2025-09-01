"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Wrench,
  BadgeDollarSign,
  RefreshCw,
  Plus,
  Sparkles,
} from "lucide-react";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Suggestion = { nome: string; precoSugerido: number; motivo?: string };

export default function SuggestionsPanel({
  onAdded,
}: {
  onAdded?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sugs, setSugs] = useState<Suggestion[]>([]);
  const [adding, setAdding] = useState<string | null>(null);

  async function loadSuggestions() {
    setErro(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ia/sugerir-servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ max: 5 }),
      });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: await res.text() };
      if (!res.ok) throw new Error(data?.error || "Falha ao obter sugestões.");
      setSugs(data?.suggestions ?? []);
    } catch (e: any) {
      setErro(e?.message || "Erro ao obter sugestões.");
      setSugs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // carrega de primeira
    loadSuggestions();
  }, []);

  async function handleAdd(s: Suggestion) {
    setAdding(s.nome);
    try {
      const res = await fetch("/api/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome: s.nome, preco: s.precoSugerido }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Erro ao criar serviço.");
      // remove da lista de sugestões
      setSugs((old) => old.filter((it) => it.nome !== s.nome));
      // avisa parent para recarregar a lista principal
      await onAdded?.();
    } catch (e: any) {
      alert(e?.message || "Erro ao adicionar o serviço");
    } finally {
      setAdding(null);
    }
  }

  return (
    <Card className="h-full lg:sticky lg:top-20">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold">Sugestões</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSuggestions}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          {loading ? "Atualizando..." : "Atualizar"}
        </Button>
      </CardHeader>

      <CardContent>
        {erro && <p className="text-sm text-red-600 mb-2">{erro}</p>}

        {loading ? (
          <div className="grid gap-3 pr-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : sugs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sem sugestões no momento.
          </p>
        ) : (
          <ScrollArea className="h-[50vh] no-scrollbar [scrollbar-gutter:stable]">
            <div className="grid gap-3 pr-3">
              {sugs.map((s) => (
                <div
                  key={s.nome}
                  className="rounded-lg border p-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-pretty leading-tight">
                      {s.nome}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                      <div className="flex items-center gap-1 mt-1">
                        <BadgeDollarSign className="w-4 h-4" />
                        {brl.format(s.precoSugerido)}
                      </div>
                      {s.motivo ? ` ${s.motivo}` : ""}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(s)}
                    disabled={adding === s.nome}
                    className="shrink-0 whitespace-nowrap px-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {adding === s.nome ? "Adicionando..." : "Adicionar"}
                  </Button>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
