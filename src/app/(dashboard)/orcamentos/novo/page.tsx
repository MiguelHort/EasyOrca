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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Pencil,
  Wallet,
  User2,
  X,
  Sparkles,
} from "lucide-react";
import { usePremium } from "@/components/PremiumProvider";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface Cliente {
  id: string;
  nome: string;
}

interface Servico {
  id: string;
  nome: string;
  preco: number; // vindo da API
}

function parseMoeda(valor: string): number | null {
  if (!valor) return null;
  const v = valor.trim();
  const br = v.replace(/\./g, "").replace(",", ".");
  const n = Number(br);
  return Number.isFinite(n) ? n : null;
}

const steps = [
  { key: "cliente", label: "Cliente", icon: User2 },
  { key: "servicos", label: "Serviços", icon: ListChecks },
  { key: "descricao", label: "Descrição", icon: Pencil },
  { key: "confirmar", label: "Confirmar", icon: Wallet },
] as const;

type StepKey = (typeof steps)[number]["key"];

export default function NovoOrcamentoPage() {
  const router = useRouter();

  const [iaLoading, setIaLoading] = useState(false);
  const [iaErro, setIaErro] = useState<string | null>(null);

  // --- Controle do wizard ---
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex].key as StepKey;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  // --- Estados de clientes ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(true);

  // --- Estados de serviços ---
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosLoading, setServicosLoading] = useState(true);
  const [servicoIds, setServicoIds] = useState<string[]>([]);
  const [servicosDialogOpen, setServicosDialogOpen] = useState(false);
  const [buscaServicos, setBuscaServicos] = useState("");

  // --- Campos do orçamento ---
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Premium status (front)
  const { isPremium, resolved } = usePremium();

  // Busca clientes
  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await fetch("/api/clientes", { credentials: "include" });
        if (!res.ok) throw new Error("Erro ao buscar clientes");
        const data = (await res.json()) as Cliente[];
        setClientes(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setClienteId(data[0].id);
        }
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
        const data = (await res.json()) as Partial<Servico>[];
        const normalizados: Servico[] = (Array.isArray(data) ? data : []).map(
          (s) => ({
            id: String(s.id),
            nome: String(s.nome),
            preco: Number(s.preco ?? 0),
          })
        );
        setServicos(normalizados);
      } catch (err) {
        console.error(err);
        setServicos([]);
      } finally {
        setServicosLoading(false);
      }
    }
    fetchServicos();
  }, []);

  // Filtro de serviços
  const servicosFiltrados = useMemo(() => {
    const termo = buscaServicos.trim().toLowerCase();
    if (!termo) return servicos;
    return servicos.filter((s) => s.nome.toLowerCase().includes(termo));
  }, [buscaServicos, servicos]);

  // Subtotal calculado dos serviços selecionados
  const subtotalServicos = useMemo(() => {
    const map = new Map(servicos.map((s) => [s.id, s.preco]));
    return servicoIds.reduce((acc, id) => acc + (map.get(id) ?? 0), 0);
  }, [servicoIds, servicos]);

  // Sugestão de total
  const sugestaoTotal = useMemo(() => {
    const n = parseMoeda(valorTotal);
    return n == null ? subtotalServicos : n;
  }, [valorTotal, subtotalServicos]);

  // Helpers serviços
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

  // Guardas de avanço
  const canNext = useMemo(() => {
    if (currentStep === "cliente") return !!clienteId;
    if (currentStep === "servicos")
      return servicoIds.length > 0 || subtotalServicos >= 0; // pode avançar sem, se for digitar valor depois
    if (currentStep === "descricao") return true; // opcional
    if (currentStep === "confirmar") return true;
    return false;
  }, [currentStep, clienteId, servicoIds.length, subtotalServicos]);

  function next() {
    setErro(null);
    if (stepIndex < steps.length - 1 && canNext) setStepIndex((i) => i + 1);
  }
  function back() {
    setErro(null);
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function handleSubmit() {
    setErro(null);
    const digitado = parseMoeda(valorTotal);
    const total = digitado ?? subtotalServicos;

    if (!clienteId) {
      setErro("Selecione um cliente.");
      setStepIndex(0);
      return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      setErro("Informe um valor total válido ou selecione serviços com preço.");
      setStepIndex(3);
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        clienteId,
        descricao: descricao?.trim() || "",
        valorTotal: total,
        servicoIds,
      };

      const res = await fetch("/api/orcamentos/novo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        setErro(err.error || "Erro ao criar orçamento.");
        return;
      }

      router.push("/orcamentos");
    } catch (err) {
      console.error(err);
      setErro("Erro inesperado ao criar orçamento.");
    } finally {
      setEnviando(false);
    }
  }

  const carregandoPagina = loadingClientes;

  return (
    <>
      <SiteHeader title="Novo Orçamento" />

      <main className="p-4 sm:p-6 max-w-3xl">
        <Card className="border-none shadow-none">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl">
                  Criar orçamento em etapas
                </CardTitle>
                <CardDescription>
                  Siga o fluxo: escolha o cliente, selecione os serviços,
                  descreva o escopo e confirme o valor.
                </CardDescription>
              </div>
              <div className="w-full sm:w-auto min-w-[140px] text-right">
                <span className="text-xs text-muted-foreground">Progresso</span>
                <Progress value={progress} className="mt-1 h-2" />
                <div className="mt-1 text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Stepper */}
            {/* Mobile: chips roláveis */}
            <div className="mt-6 md:hidden -mx-2 px-2">
              <div className="flex flex-col gap-2 overflow-x-auto no-scrollbar py-1">
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  const active = idx === stepIndex;
                  const done = idx < stepIndex;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setStepIndex(idx)}
                      className={cn(
                        "shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : done
                          ? "border-green-600/40 bg-green-600/10 text-green-700 dark:text-green-300"
                          : "border-muted text-muted-foreground"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <Icon className="size-4" />
                      )}
                      <span className="whitespace-nowrap">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop/Tablet: grade de etapas */}
            <ol className="mt-4 hidden md:grid grid-cols-4 gap-2">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const done = idx < stepIndex;
                const active = idx === stepIndex;
                return (
                  <li
                    key={s.key}
                    className={cn(
                      "rounded-xl border p-3 flex items-center gap-3",
                      active
                        ? "border-primary bg-primary/5"
                        : done
                        ? "border-green-600/40 bg-green-600/5"
                        : "border-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "size-8 rounded-full grid place-items-center",
                        active
                          ? "bg-primary text-primary-foreground"
                          : done
                          ? "bg-green-600 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 className="size-5" />
                      ) : (
                        <Icon className="size-5" />
                      )}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs text-muted-foreground">
                        Etapa {idx + 1}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          active && "text-primary"
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
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
              <div className="grid gap-6">
                {erro && (
                  <div className="text-sm text-red-600 border border-red-300 bg-red-50 rounded px-3 py-2">
                    {erro}
                  </div>
                )}

                {/* === STEP 1: CLIENTE === */}
                {currentStep === "cliente" && (
                  <section className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="cliente">Cliente</Label>
                      <select
                        id="cliente"
                        value={clienteId}
                        onChange={(e) => setClienteId(e.target.value)}
                        disabled={clientes.length === 0 || enviando}
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
                      <p className="text-xs text-muted-foreground">
                        Selecione o cliente destinatário deste orçamento.
                      </p>
                    </div>
                  </section>
                )}

                {/* === STEP 2: SERVIÇOS === */}
                {currentStep === "servicos" && (
                  <section className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Serviços selecionados</Label>
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
                                {s.nome} · {brl.format(s.preco || 0)}
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

                      <div className="text-xs text-muted-foreground">
                        Subtotal:{" "}
                        <span className="font-medium">
                          {brl.format(subtotalServicos)}
                        </span>
                      </div>
                    </div>

                    <Dialog
                      open={servicosDialogOpen}
                      onOpenChange={setServicosDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={servicosLoading || enviando}
                          className="w-full"
                        >
                          {servicosLoading
                            ? "Carregando serviços..."
                            : "Selecionar serviços"}
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-[95vw] sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Selecionar serviços</DialogTitle>
                        </DialogHeader>

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

                        <ScrollArea className="h-[50vh] sm:h-64 rounded-md border p-2">
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
                                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-muted cursor-pointer"
                                >
                                  <div className="flex items-center gap-3">
                                    <Checkbox
                                      checked={servicoIds.includes(s.id)}
                                      onCheckedChange={() =>
                                        toggleServico(s.id)
                                      }
                                    />
                                    <span className="text-sm">{s.nome}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {brl.format(s.preco || 0)}
                                  </span>
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
                            Fechar
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
                  </section>
                )}

                {/* === STEP 3: DESCRIÇÃO === */}
                {currentStep === "descricao" && (
                  <section className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="grid gap-1">
                        <Label htmlFor="descricao">Descrição do escopo</Label>
                        <p className="text-xs text-muted-foreground">
                          Gere automaticamente com IA com base nos serviços
                          selecionados ou edite manualmente.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Botão IA só habilita se Premium */}
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            iaLoading || enviando || !resolved || !isPremium
                          }
                          onClick={async () => {
                            if (!resolved || !isPremium) return;
                            if (iaLoading) return;
                            setIaErro(null);
                            setIaLoading(true);
                            try {
                              const payload = {
                                clienteNome: clientes.find(
                                  (c) => c.id === clienteId
                                )?.nome,
                                servicos: servicoIds
                                  .map((id) =>
                                    servicos.find((s) => s.id === id)
                                  )
                                  .filter(Boolean)
                                  .map((s) => ({
                                    id: s!.id,
                                    nome: s!.nome,
                                    preco: s!.preco,
                                  })),
                                valorTotal:
                                  parseMoeda(valorTotal) ?? subtotalServicos,
                              };
                              const res = await fetch("/api/ia/descricao", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                                credentials: "include",
                              });
                              const data = await res.json().catch(() => ({}));
                              if (!res.ok || !data?.descricao) {
                                throw new Error(
                                  data?.error || "Falha ao gerar descrição."
                                );
                              }
                              setDescricao(data.descricao);
                            } catch (e: any) {
                              setIaErro(
                                e?.message || "Erro ao gerar descrição."
                              );
                            } finally {
                              setIaLoading(false);
                            }
                          }}
                          title={
                            !resolved
                              ? "Verificando seu status..."
                              : !isPremium
                              ? "Recurso exclusivo do Premium"
                              : "Gerar descrição com IA"
                          }
                        >
                          {iaLoading ? (
                            "Gerando..."
                          ) : (
                            <span className="flex justify-center items-center gap-1">
                              <Sparkles className="inline text-primary mr-1 h-4 w-4" />
                              Gerar com IA
                            </span>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          disabled={iaLoading || enviando || !descricao}
                          onClick={() => setDescricao("")}
                        >
                          Limpar
                        </Button>
                      </div>
                    </div>

                    {/* CTA para não-assinantes */}
                    {resolved && !isPremium && (
                      <div className="text-xs border rounded-md p-3">
                        <span className="text-muted-foreground">
                          Este recurso é exclusivo para assinantes{" "}
                          <strong>OneOrça</strong>.
                        </span>{" "}
                        <a href="/upgrade" className="underline">
                          Fazer parte
                        </a>
                      </div>
                    )}

                    {iaErro && (
                      <div className="text-xs text-red-600 border border-red-300 bg-red-50 rounded px-3 py-2">
                        {iaErro}
                      </div>
                    )}

                    <Textarea
                      id="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Ex: Instalação elétrica, troca de tomada..."
                      rows={8}
                      disabled={enviando || iaLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Dica: revise o texto antes de confirmar. Se não gostar,
                      clique em <strong>Limpar</strong> e gere novamente.
                    </p>
                  </section>
                )}

                {/* === STEP 4: CONFIRMAR === */}
                {currentStep === "confirmar" && (
                  <section className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="valor">Valor total (R$)</Label>
                      <Input
                        id="valor"
                        inputMode="decimal"
                        value={valorTotal}
                        onChange={(e) => setValorTotal(e.target.value)}
                        placeholder={brl
                          .format(subtotalServicos)
                          .replace("\u00A0", " ")}
                        disabled={enviando}
                      />
                      <p className="text-xs text-muted-foreground">
                        Sugestão:{" "}
                        <span className="font-medium">
                          {brl.format(sugestaoTotal || 0)}
                        </span>
                        {valorTotal.trim()
                          ? " (usando o valor digitado)"
                          : " (usando o subtotal dos serviços)"}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Cliente</span>
                        <strong>
                          {clientes.find((c) => c.id === clienteId)?.nome ?? "—"}
                        </strong>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-muted-foreground">Serviços</span>
                        <div className="max-w-[70%]">
                          {servicoIds.length === 0 ? (
                            <span>—</span>
                          ) : (
                            <ul className="list-disc pl-4 space-y-1">
                              {servicoIds.map((id) => {
                                const s = servicos.find((x) => x.id === id);
                                if (!s) return null;
                                return (
                                  <li
                                    key={id}
                                    className="flex items-center justify-between gap-4"
                                  >
                                    <span>{s.nome}</span>
                                    <span className="text-muted-foreground">
                                      {brl.format(s.preco || 0)}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Descrição</span>
                        <p className="mt-1 whitespace-pre-wrap">
                          {descricao || "—"}
                        </p>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-base">
                        <span className="text-muted-foreground">
                          Subtotal serviços
                        </span>
                        <span>{brl.format(subtotalServicos)}</span>
                      </div>
                      <div className="flex items-center justify-between text-base">
                        <span className="font-medium">Total</span>
                        <span className="font-semibold">
                          {brl.format(sugestaoTotal || 0)}
                        </span>
                      </div>
                    </div>
                  </section>
                )}

                {/* Navegação */}
                <div className="md:mt-2 flex items-center justify-between">
                  <div className="sticky bottom-2 left-0 right-0">
                    <div className="md:p-0 p-2 mx-[-0.5rem] sm:mx-0 bg-background/95 md:bg-transparent backdrop-blur md:backdrop-blur-0 border md:border-0 rounded-xl md:rounded-none shadow md:shadow-none flex items-center justify-between gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={back}
                        disabled={stepIndex === 0 || enviando}
                        className="w-auto"
                      >
                        <ChevronLeft className="mr-1 size-4" /> Voltar
                      </Button>

                      {stepIndex < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={next}
                          disabled={!canNext || enviando}
                          className="w-auto"
                        >
                          Avançar <ChevronRight className="ml-1 size-4" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={enviando}
                          className="w-auto"
                        >
                          {enviando ? "Gerando..." : "Gerar Orçamento"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
