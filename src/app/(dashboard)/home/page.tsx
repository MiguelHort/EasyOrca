// app/home/page.tsx (ou o caminho correspondente ao seu DashboardPage)
"use client";

import { useEffect, useState } from "react";
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
  valorTotal: StatItem;    // value em BRL
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

  async function fetchAll() {
    setErroMsg(null);
    setStatsError(null);
    setLoading(true);
    setStatsLoading(true);
    try {
      const [orcRes, statsRes] = await Promise.all([
        fetch("/api/orcamentos", { credentials: "include" }),
        fetch("/api/dashboard/stats", { credentials: "include" }),
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

  return (
    <>
      <SiteHeader title="Dashboard" />

      <main className="min-h-screen bg-background">
        <div>
          <header className={`flex justify-between mx-auto px-4 sm:px-6 lg:px-20 py-8 bg-gradient-to-r ${isPremium ? "from-[#172658]" : "from-primary" } to-blue-400 dark:to-blue-800 text-white`}>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                Olá{user?.name ? `, ${user.name}` : ""}! 👋
              </h1>
              <p className="text-sm mt-1">
                Mais um dia para fechar bons negócios com confiança!
              </p>
              {isError && (
                <p className="mt-2 text-sm text-red-100/90">
                  {errorMessage ?? "Não foi possível obter informações do usuário."}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              {premiumLoading ? (
                <Skeleton className="h-7 w-28 rounded-2xl" />
              ) : isPremium ? (
                <div className="flex items-center text-xs font-semibold border border-white/40 rounded-2xl py-1 px-3 bg-white/10">
                  <Crown className="h-4 w-4 mr-2" />
                  The One
                </div>
              ) : (
                <>
                  <div className="text-xs font-semibold border border-white/40 rounded-2xl py-1 px-3 bg-blue-400/60">
                    Plano Grátis
                  </div>
                  <Link href="/upgrade">
                    <Button className="flex items-center bg-background text-primary">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade para PRO
                    </Button>
                  </Link>
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
                <Button variant={"outline"} className="border-primary border-2 dark:border-primary cursor-pointer">
                  <FilePlus2 className="h-5 w-5" />
                  Orçamentos
                </Button>
              </Link>
              <Link href="/clientes">
                <Button variant={"outline"} className="border-primary border-2 dark:border-primary cursor-pointer">
                  <Users className="h-5 w-5" />
                  Clientes
                </Button>
              </Link>
              <Link href="/servicos">
                <Button variant={"outline"} className="border-primary border-2 dark:border-primary cursor-pointer">
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
                icon={<FilePlus2 className="text-primary h-4 w-4 sm:h-6 sm:w-6" />}
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
                icon={<TrendingUp className="text-primary h-4 w-4 sm:h-6 sm:w-6" />}
                title="Taxa de Conversão"
                value={stats?.taxaConversao.value ?? null}
                description={stats?.taxaConversao.label ?? "—"}
                percentage={stats?.taxaConversao.changePct ?? null} // delta em pp
                valueType="percent"
                loading={statsLoading}
              />
              <InfoCard
                icon={<DollarSign className="text-primary h-4 w-4 sm:h-6 sm:w-6" />}
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
                <CardDescription>Veja e gerencie todos os orçamentos criados.</CardDescription>
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
                    <p className="text-muted-foreground text-sm">Nenhum orçamento encontrado.</p>
                  ) : (
                    <div className="grid gap-4">
                      {orcamentos.map((o) => (
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

            {/* Upsell vs PRO */}
            {!premiumLoading && !isPremium ? (
              <Card className="flex-1 rounded-xl border border-blue-600 bg-blue-50/50 dark:bg-blue-950 p-6 shadow-sm">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-2 text-blue-600 text-xl font-semibold">
                    <Crown className="h-5 w-5 text-blue-600" />
                    Upgrade para PRO
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Desbloqueie recursos avançados para seu negócio
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-2 text-gray-500 text-sm mb-6">
                    {["Orçamentos ilimitados", "Templates premium", "Integração com Pix", "Relatórios avançados"].map(
                      (item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                  <Link href="/upgrade">
                    <Button className="w-full bg-primary text-white text-sm shadow-md">Fazer parte</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : null}

            {!premiumLoading && isPremium ? (
              <Card className="flex-1 rounded-xl border border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950 p-6 shadow-sm">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-2 text-emerald-700 text-xl font-semibold">
                    <Crown className="h-5 w-5" />
                    Você é PRO ✨
                  </CardTitle>
                  <CardDescription className="text-sm text-emerald-700/80">
                    Obrigado por apoiar o EasyOrça! Aproveite todos os recursos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="space-y-2 text-emerald-700/90 text-sm">
                    {[
                      "Acesso a templates premium",
                      "Relatórios e métricas avançadas",
                      "Prioridade em futuras integrações",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : null}
          </section>
        </div>
      </main>

      {!premiumLoading && !isPremium && <ShowPremiumDialog />}
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
            <div className="flex sm:hidden bg-primary/10 p-3 rounded-lg">{icon}</div>
          </div>

          <div className="flex items-center justify-between w-full mt-2">
            <div>
              <p className="text-xl sm:text-xl font-bold text-foreground">
                {loading ? <Skeleton className="h-6 w-24 rounded-md" /> : formattedValue}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {loading ? <Skeleton className="h-4 w-28 rounded-md mt-1" /> : description}
              </p>
            </div>
            <div className="hidden sm:flex bg-primary/10 p-3 rounded-lg">{icon}</div>
          </div>
        </div>
        <div className="mt-4">
          {loading ? (
            <Skeleton className="h-4 w-32 rounded-md" />
          ) : (
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className={`${isNeg ? "text-red-600" : "text-green-600"} font-semibold`}>
                {valueType === "percent" ? `${delta >= 0 ? "+" : ""}${delta} pp` : `${delta >= 0 ? "+" : ""}${delta}%`}
              </span>{" "}
              vs mês anterior
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
