"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface Cliente {
  id: string;
  nome: string;
}

interface Servico {
  id: string;
  nome: string;
  // preco?: number; // descomente se sua API retornar preço
}

export default function NovoOrcamentoPage() {
  const router = useRouter();

  // --- Estados de clientes ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(true);

  // --- Estados de serviços ---
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosLoading, setServicosLoading] = useState(true);
  const [servicoIds, setServicoIds] = useState<string[]>([]); // selecionados
  const [servicosDialogOpen, setServicosDialogOpen] = useState(false);
  const [buscaServicos, setBuscaServicos] = useState("");

  // --- Campos do orçamento ---
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");

  // Busca clientes
  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await fetch("/api/clientes", { credentials: "include" });
        if (!res.ok) throw new Error("Erro ao buscar clientes");
        const data = await res.json();
        const lista: Cliente[] = Array.isArray(data) ? data : [];
        setClientes(lista);
        if (lista.length > 0) setClienteId(lista[0].id);
      } catch (err) {
        console.error(err);
        setClientes([]);
        setClienteId("");
      } finally {
        setLoadingClientes(false);
      }
    }
    fetchClientes();
  }, []);

  // Busca serviços
  useEffect(() => {
    async function fetchServicos() {
      try {
        const res = await fetch("/api/servicos", { credentials: "include" });
        if (!res.ok) throw new Error("Erro ao buscar serviços");
        const data = await res.json();
        setServicos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setServicos([]);
      } finally {
        setServicosLoading(false);
      }
    }
    fetchServicos();
  }, []);

  // Filtro de serviços (memoizado)
  const servicosFiltrados = useMemo(() => {
    const termo = buscaServicos.trim().toLowerCase();
    if (!termo) return servicos;
    return servicos.filter((s) => s.nome.toLowerCase().includes(termo));
  }, [buscaServicos, servicos]);

  // Helpers para seleção
  function toggleServico(id: string) {
    setServicoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function removerServico(id: string) {
    setServicoIds((prev) => prev.filter((x) => x !== id));
  }

  function selecionarTodosVisiveis() {
    const visiveis = servicosFiltrados.map((s) => s.id);
    setServicoIds((prev) => Array.from(new Set([...prev, ...visiveis])));
  }

  function limparSelecao() {
    setServicoIds([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valor = parseFloat(valorTotal);
    if (!clienteId || isNaN(valor)) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    try {
      const payload = {
        clienteId,
        descricao,
        valorTotal: valor,
        servicoIds, // enviado para o backend
      };

      const res = await fetch("/api/orcamentos/novo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erro ao criar orçamento");
        return;
        }
      router.push("/orcamentos");
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao criar orçamento.");
    }
  }

  const carregandoPagina = loadingClientes;

  return (
    <>
      <SiteHeader title="Novo Orçamento" />

      <main className="p-6 max-w-2xl">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Novo Orçamento</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para gerar o orçamento.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {carregandoPagina ? (
              <div className="grid gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
                {/* Cliente */}
                <div className="grid gap-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <select
                    id="cliente"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    disabled={clientes.length === 0}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    {clientes.length === 0 ? (
                      <option value="" disabled>
                        Nenhum cliente encontrado
                      </option>
                    ) : (
                      clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Serviços */}
                <div className="grid gap-2">
                  <Label>Serviços</Label>

                  {/* Badges dos serviços selecionados */}
                  {servicoIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {servicoIds.map((id) => {
                        const s = servicos.find((x) => x.id === id);
                        if (!s) return null;
                        return (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {s.nome}
                            <button
                              type="button"
                              onClick={() => removerServico(id)}
                              className="ml-1"
                              aria-label={`Remover ${s.nome}`}
                              title={`Remover ${s.nome}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhum serviço selecionado.
                    </p>
                  )}

                  {/* Botão que abre o Dialog */}
                  <Dialog open={servicosDialogOpen} onOpenChange={setServicosDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={servicosLoading}
                        className="w-full"
                      >
                        {servicosLoading ? "Carregando serviços..." : "Selecionar serviços"}
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Selecionar serviços</DialogTitle>
                      </DialogHeader>

                      {/* Busca */}
                      <div className="grid gap-2">
                        <Label htmlFor="busca-servicos">Buscar</Label>
                        <Input
                          id="busca-servicos"
                          autoFocus
                          placeholder="Digite para filtrar..."
                          value={buscaServicos}
                          onChange={(e) => setBuscaServicos(e.target.value)}
                        />
                      </div>

                      {/* Ações rápidas */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={selecionarTodosVisiveis}
                          disabled={servicosFiltrados.length === 0}
                        >
                          Selecionar todos visíveis
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={limparSelecao}
                          disabled={servicoIds.length === 0}
                        >
                          Limpar seleção
                        </Button>
                      </div>

                      {/* Lista com scroll e checkbox */}
                      <ScrollArea className="h-64 rounded-md border p-2">
                        <div className="grid gap-2">
                          {servicosLoading ? (
                            <div className="grid gap-2">
                              <Skeleton className="h-8 w-full" />
                              <Skeleton className="h-8 w-full" />
                              <Skeleton className="h-8 w-full" />
                            </div>
                          ) : servicosFiltrados.length === 0 ? (
                            <p className="text-sm text-muted-foreground px-1">
                              {buscaServicos
                                ? "Nenhum serviço corresponde ao filtro."
                                : "Nenhum serviço cadastrado."}
                            </p>
                          ) : (
                            servicosFiltrados.map((s) => (
                              <label
                                key={s.id}
                                className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted cursor-pointer"
                              >
                                <Checkbox
                                  checked={servicoIds.includes(s.id)}
                                  onCheckedChange={() => toggleServico(s.id)}
                                />
                                <span className="text-sm">{s.nome}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </ScrollArea>

                      <DialogFooter className="mt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setServicosDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setServicosDialogOpen(false)}
                        >
                          Anexar {servicoIds.length} serviço
                          {servicoIds.length === 1 ? "" : "s"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Descrição */}
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição dos serviços</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Instalação elétrica, troca de tomada..."
                    rows={4}
                  />
                </div>

                {/* Valor */}
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor total (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                    placeholder="Ex: 250.00"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Gerar Orçamento
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
