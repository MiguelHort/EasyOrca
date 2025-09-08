// app/home/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  FilePlus2,
  Users,
  Wrench,
  CheckCircle,
  Crown,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { usePremium } from "@/components/PremiumProvider";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CardOrcamento, { Orcamento } from "@/components/CardOrcamento";
import { ShowPremiumDialog } from "@/components/ShowPremiumDialog";

type StatItem = { value: number; changePct: number; label: string };
type DashboardStats = {
  orcamentosCriados: StatItem;
  clientesCadastrados: StatItem;
  taxaConversao: StatItem; // value em %
  valorTotal: StatItem; // value em BRL
};

export default function DashboardPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const { user, isLoading: userLoading, isError, errorMessage } = useUser();
  const { isPremium, resolved } = usePremium();

  const premiumLoading = !resolved;

  useEffect(() => {
    fetchAll();
  }, []);

  function getFirstAndLastName(fullName?: string | null): string {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }

  async function fetchAll() {
    setErroMsg(null);
    setStatsError(null);
    setLoading(true);
    setStatsLoading(true);
    try {
      const [orcRes, statsRes] = await Promise.all([
        fetch("/api/orcamentos", { credentials: "include", cache: "no-store" }),
        fetch("/api/dashboard/stats", {
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (!orcRes.ok) throw new Error(`Erro orçamentos ${orcRes.status}`);
      if (!statsRes.ok) throw new Error(`Erro stats ${statsRes.status}`);

      const orcData = await orcRes.json();
      const statsData = await statsRes.json();

      setOrcamentos(orcData);
      setStats(statsData?.stats ?? null);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
      const msg = err instanceof Error ? err.message : "Erro ao carregar dados";
      setErroMsg(msg);
      setStatsError(msg);
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  }

  // Enquanto usuário/premium não resolveram, evite montar UI "Free" por engano
  const isBootLoading = userLoading || premiumLoading;

  // Classe do gradiente só decide depois que premium estiver resolvido
  const headerFromColor = resolved
    ? isPremium
      ? "from-[#172658]"
      : "from-primary"
    : "from-primary/60";

  return (
    <>
      <SiteHeader title="Dashboard" />

      <main className="min-h-screen bg-background">
        <div>
          <header
            className={`flex justify-between mx-auto px-4 sm:px-6 lg:px-20 py-8 bg-gradient-to-r ${headerFromColor} to-blue-400 dark:to-blue-800 text-white`}
          >
            <div>
              <h1 className="text-lg sm:text-3xl font-bold tracking-tight">
                Olá
                {getFirstAndLastName(user?.name)
                  ? `, ${getFirstAndLastName(user?.name)}`
                  : ""}
                ! 👋
              </h1>
              <p className="text-xs md:text-sm mt-1">
                Mais um dia para fechar bons negócios com confiança!
              </p>
              {isError && (
                <p className="mt-2 text-sm text-red-100/90">
                  {errorMessage ??
                    "Não foi possível obter informações do usuário."}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isBootLoading ? (
                <Skeleton className="h-7 w-28 rounded-2xl" />
              ) : isPremium ? (
                <div className="flex items-center min-w-25 text-xs font-semibold border border-white/40 rounded-2xl py-1 px-3 bg-white/10">
                  <Crown className="h-4 w-4 mr-2" />
                  The One
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center gap-2">
                    <div className="text-xs font-semibold border border-white/40 rounded-2xl py-1 px-2 bg-blue-400/60">
                      Plano Grátis
                    </div>
                    <Link href="/upgrade">
                      <Button className="flex items-center bg-background text-primary text-[10px] md:text-xs hover:bg-background/90">
                        <Crown className="h-2 w-2 mr-0.5" />
                        Seja One
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </header>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Acesso Rápido</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/orcamentos">
                <Button
                  variant={"outline"}
                  className="border-primary border-2 dark:border-primary cursor-pointer"
                >
                  <FilePlus2 className="h-5 w-5" />
                  Orçamentos
                </Button>
              </Link>
              <Link href="/clientes">
                <Button
                  variant={"outline"}
                  className="border-primary border-2 dark:border-primary cursor-pointer"
                >
                  <Users className="h-5 w-5" />
                  Clientes
                </Button>
              </Link>
              <Link href="/servicos">
                <Button
                  variant={"outline"}
                  className="border-primary border-2 dark:border-primary cursor-pointer"
                >
                  <Wrench className="h-5 w-5" />
                  Serviços
                </Button>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>

            <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-4 gap-6">
              <InfoCard
                icon={
                  <FilePlus2 className="text-primary h-4 w-4 sm:h-6 sm:w-6" />
                }
                title="Orçamentos criados"
                value={stats?.orcamentosCriados.value ?? null}
                description={stats?.orcamentosCriados.label ?? "—"}
                percentage={stats?.orcamentosCriados.changePct ?? null}
                valueType="number"
                loading={statsLoading}
              />
              <InfoCard
                icon={<Users className="text-primary h-4 w-4 sm:h-6 sm:w-6" />}
                title="Clientes cadastrados"
                value={stats?.clientesCadastrados.value ?? null}
                description={stats?.clientesCadastrados.label ?? "—"}
                percentage={stats?.clientesCadastrados.changePct ?? null}
                valueType="number"
                loading={statsLoading}
              />
              <InfoCard
                icon={
                  <TrendingUp className="text-primary h-4 w-4 sm:h-6 sm:w-6" />
                }
                title="Taxa de Conversão"
                value={stats?.taxaConversao.value ?? null}
                description={stats?.taxaConversao.label ?? "—"}
                percentage={stats?.taxaConversao.changePct ?? null}
                valueType="percent"
                loading={statsLoading}
              />
              <InfoCard
                icon={
                  <DollarSign className="text-primary h-4 w-4 sm:h-6 sm:w-6" />
                }
                title="Valor Total"
                value={stats?.valorTotal.value ?? null}
                description={stats?.valorTotal.label ?? "—"}
                percentage={stats?.valorTotal.changePct ?? null}
                valueType="currency"
                loading={statsLoading}
              />
            </div>
          </section>

          <section className="flex flex-col md:flex-row mt-10 gap-10">
            {/* Orçamentos */}
            <Card className="border-border flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePlus2 className="h-6 w-6 text-primary" />
                  Seus Orçamentos
                </CardTitle>
                <CardDescription>
                  Veja e gerencie todos os orçamentos criados.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm flex flex-col gap-4">
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
                      {orcamentos
                        .slice(-3)
                        .reverse()
                        .map((o) => (
                          <CardOrcamento key={o.id} orcamento={o} />
                        ))}
                    </div>
                  )}
                </ScrollArea>
                <Link href="/orcamentos">
                  <Button variant="default" className="w-full">
                    Ver Orçamentos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Card de Upgrade para PRO - Minimalista Sofisticado */}
            {!isBootLoading && !isPremium ? (
              <Card className="group relative flex-1 rounded-2xl border-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 p-7 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                {/* Efeito sutil de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <CardHeader className="p-0 mb-6 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white text-xl font-semibold">
                      <Crown className="h-5 w-5 text-blue-600" />
                      Upgrade para PRO
                    </CardTitle>
                    <div className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-md">
                      Popular
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Desbloqueie recursos avançados para seu negócio
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 relative z-10">
                  <div className="space-y-3 mb-7">
                    {[
                      { text: "Orçamentos ilimitados" },
                      { text: "Templates premium exclusivos" },
                      { text: "Integração instantânea com Pix" },
                      { text: "Relatórios e analytics avançados" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/40 dark:hover:bg-gray-800/40 transition-colors duration-200"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link href="/upgrade" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.01]">
                      Começar agora
                    </Button>
                  </Link>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    Teste grátis por 7 dias
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {/* Card PRO Ativo - Minimalista Sofisticado */}
            {!isBootLoading && isPremium ? (
              <Card className="relative flex-1 rounded-2xl border-0 bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/30 p-7 shadow-sm overflow-hidden">
                {/* Efeito sutil de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/20 to-transparent opacity-50"></div>

                <CardHeader className="p-0 mb-6 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="flex items-center gap-3 text-gray-900 dark:text-white text-xl font-semibold">
                      <Crown className="h-5 w-5 text-emerald-600" />
                      Você é The One!
                    </CardTitle>
                    <div className="px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded-md">
                      Ativo
                    </div>
                  </div>
                  <CardDescription className="text-emerald-700 dark:text-emerald-300">
                    Obrigado por apoiar o EasyOrça! Aproveite todos os recursos
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0 relative z-10">
                  <div className="space-y-3 mb-6">
                    {[
                      { text: "Acesso a templates premium" },
                      { text: "Relatórios e métricas avançadas" },
                      { text: "Prioridade em futuras integrações" },
                      { text: "Suporte prioritário VIP" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-100/30 dark:hover:bg-emerald-800/20 transition-colors duration-200"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full flex-shrink-0"></div>
                        <span className="text-emerald-800 dark:text-emerald-200 text-sm">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-xl text-center">
                    <p className="font-medium">Status: Premium Ativo</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </section>
        </div>
      </main>

      {/* Só mostre o modal quando tiver certeza de que NÃO é premium */}
      {!isBootLoading && !isPremium && <ShowPremiumDialog />}
    </>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  value: number | null;
  description: string;
  percentage: number | null; // "vs mês anterior"
  valueType?: "percent" | "currency" | "number";
  loading?: boolean;
};

function InfoCard({
  icon,
  title,
  value,
  description,
  percentage,
  valueType = "number",
  loading = false,
}: InfoCardProps) {
  const formattedValue =
    value == null
      ? "—"
      : valueType === "currency"
      ? value.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : valueType === "percent"
      ? `${value}%`
      : value;

  const delta = percentage ?? 0;
  const isNeg = delta < 0;

  return (
    <Card className="border-border">
      <CardContent className="px-6">
        <div className="flex flex-col items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground text-start w-full">
              {title}
            </p>
            <div className="flex sm:hidden bg-primary/10 p-3 rounded-lg">
              {icon}
            </div>
          </div>

          <div className="flex items-center justify-between w-full mt-2">
            <div>
              <p className="text-xl sm:text-xl font-bold text-foreground">
                {loading ? (
                  <Skeleton className="h-6 w-24 rounded-md" />
                ) : (
                  formattedValue
                )}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-4 w-28 rounded-md mt-1" />
                ) : (
                  description
                )}
              </p>
            </div>
            <div className="hidden sm:flex bg-primary/10 p-3 rounded-lg">
              {icon}
            </div>
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-4 w-32 rounded-md" />
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span
                className={`${
                  isNeg ? "text-red-600" : "text-green-600"
                } font-semibold`}
              >
                {valueType === "percent"
                  ? `${delta >= 0 ? "+" : ""}${delta} pp`
                  : `${delta >= 0 ? "+" : ""}${delta}%`}
              </span>{" "}
              vs mês anterior
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
