// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  FilePlus2,
  Users,
  Wrench,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

// Recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

type KPI = {
  budgets: number;
  approved: number;
  conversion: number; // %
  totalValue: number; // BRL
  avgTicket: number; // BRL
  newClients: number;
  servicesCatalog: number;
};
type SeriesRevenue = { x: string; total: number }[];
type SeriesConversion = { x: string; conversion: number }[];
type TopItem = { name: string; qty?: number; count?: number; total: number };
type RecentBudget = {
  id: string;
  createdAt: string;
  status: string;
  valorTotal: number;
  clienteNome: string;
};

type OverviewResponse = {
  ok: boolean;
  period: { start: string; end: string; range: string };
  kpis: KPI;
  series: { revenue: SeriesRevenue; conversion: SeriesConversion };
  top: { services: TopItem[]; clients: TopItem[] };
  recentBudgets: RecentBudget[];
};

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

const rangeOptions = [
  { value: "this-month", label: "Este mês" },
  { value: "last-7d", label: "Últimos 7 dias" },
  { value: "last-30d", label: "Últimos 30 dias" },
  { value: "this-quarter", label: "Este trimestre" },
  { value: "this-year", label: "Este ano" },
];

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case "enviado":
      return "text-blue-600 bg-blue-100";
    case "aprovado":
      return "text-green-600 bg-green-100";
    case "rejeitado":
      return "text-red-600 bg-red-100";
    case "rascunho":
      return "text-muted-foreground bg-muted-foreground/10";
    default:
      return "text-foreground bg-foreground/10";
  }
}

export default function DashboardPage() {
  const [range, setRange] = useState<string>("this-month");
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchOverview() {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/dashboard/overview?range=${range}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const json: OverviewResponse = await res.json();
        if (active) setData(json);
      } catch (e) {
        console.error(e);
        if (active)
          setErr(e instanceof Error ? e.message : "Erro ao carregar dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchOverview();
    return () => {
      active = false;
    };
  }, [range]);

  const k = data?.kpis;
  const seriesRevenue = data?.series.revenue ?? [];
  const seriesConversion = data?.series.conversion ?? [];
  const topServices = data?.top.services ?? [];
  const topClients = data?.top.clients ?? [];
  const recent = data?.recentBudgets ?? [];

  return (
    <>
      <SiteHeader title="Analytics" />
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header + Filtro */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Acompanhe seus principais indicadores.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {rangeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setRange((r) => r)}>
                Atualizar
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Valor no período"
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              value={k?.totalValue != null ? fmtBRL(k.totalValue) : "—"}
              loading={loading}
              description="Soma dos orçamentos"
            />
            <KpiCard
              title="Taxa de conversão"
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              value={k?.conversion != null ? `${k.conversion}%` : "—"}
              loading={loading}
              description="Aprovados / Criados"
            />
            <KpiCard
              title="Orçamentos aprovados"
              icon={<CheckCircle2 className="h-5 w-5 text-primary" />}
              value={k?.approved != null ? k.approved.toString() : "—"}
              loading={loading}
              description="No período"
            />
            <KpiCard
              title="Ticket médio"
              icon={<FilePlus2 className="h-5 w-5 text-primary" />}
              value={k?.avgTicket != null ? fmtBRL(k.avgTicket) : "—"}
              loading={loading}
              description="Média por orçamento"
            />
          </div>

          <DashboardAiSummaryCard data={data} range={range} />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle>Evolução de Receita</CardTitle>
                <CardDescription>
                  Soma dos orçamentos por período
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {loading ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={seriesRevenue}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="var(--primary)"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--primary)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="x" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => fmtBRL(v)} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="var(--primary)"
                        fill="url(#g1)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Conversão por mês</CardTitle>
                <CardDescription>% de orçamentos aprovados</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {loading ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seriesConversion}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="x" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => `${v}%`} />
                      <Bar
                        dataKey="conversion"
                        fill="var(--primary)"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top lists + Catálogo/Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle>Orçamentos recentes</CardTitle>
                <CardDescription>Os 10 últimos no período</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Scroll vertical do card */}
                <ScrollArea className="h-[360px] pr-4">
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                      ))}
                    </div>
                  ) : (
                    // Wrapper para scroll horizontal no mobile
                    <div className="-mx-2 sm:mx-0">
                      <div className="overflow-x-auto">
                        {/* Defina uma largura mínima para ativar o scroll em telas pequenas */}
                        <div className="min-w-[640px] sm:min-w-0">
                          <Table className="w-full">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                  Valor
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {recent.length === 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                  >
                                    Sem registros
                                  </TableCell>
                                </TableRow>
                              )}
                              {recent.map((r) => (
                                <TableRow
                                  key={r.id}
                                  className="whitespace-nowrap"
                                >
                                  <TableCell>
                                    {new Date(r.createdAt).toLocaleDateString(
                                      "pt-BR"
                                    )}
                                  </TableCell>
                                  <TableCell>{r.clienteNome}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`py-0.5 px-2 text-xs rounded-2xl ${statusClass(
                                        r.status
                                      )}`}
                                    >
                                      {r.status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {fmtBRL(r.valorTotal)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Barra de rolagem horizontal do shadcn (aparece quando necessário) */}
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="grid grid-rows-2 gap-6">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" /> Top serviços
                  </CardTitle>
                  <CardDescription>Mais vendidos no período</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full rounded-md" />
                      ))}
                    </div>
                  ) : topServices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem dados</p>
                  ) : (
                    <ul className="space-y-2">
                      {topServices.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="rounded-full w-6 justify-center"
                            >
                              {i + 1}
                            </Badge>
                            <span className="font-medium">{s.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {s.qty != null && (
                              <span className="mr-3">{s.qty} un.</span>
                            )}
                            <span>{fmtBRL(s.total)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Top clientes
                  </CardTitle>
                  <CardDescription>Maior volume de orçamentos</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full rounded-md" />
                      ))}
                    </div>
                  ) : topClients.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem dados</p>
                  ) : (
                    <ul className="space-y-2">
                      {topClients.map((c, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="rounded-full w-6 justify-center"
                            >
                              {i + 1}
                            </Badge>
                            <span className="font-medium">{c.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {c.count != null && (
                              <span className="mr-3">{c.count} orç.</span>
                            )}
                            <span>{fmtBRL(c.total)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function KpiCard({
  title,
  value,
  icon,
  description,
  loading,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {icon} {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-36 rounded-md" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    {
      label: string;
      variant:
        | "default"
        | "secondary"
        | "destructive"
        | "outline"
        | "success"
        | undefined;
    }
  > = {
    rascunho: { label: "Rascunho", variant: "secondary" },
    enviado: { label: "Enviado", variant: "outline" },
    aprovado: { label: "Aprovado", variant: "success" as any },
    rejeitado: { label: "Rejeitado", variant: "destructive" },
  };
  const v = map[status] ?? { label: status, variant: "outline" as const };
  return <Badge variant={v.variant as any}>{v.label}</Badge>;
}

function DashboardAiSummaryCard({
  data,
  range,
}: {
  data: OverviewResponse | null;
  range: string;
}) {
  const [loading, setLoading] = useState(false);
  const [txt, setTxt] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    if (!data) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/ia/dashboard-summary", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: data.period,
          kpis: data.kpis,
          top: data.top,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Erro ao gerar resumo");
      setTxt(j.summary || "");
    } catch (e: any) {
      setErr(e?.message || "Falha ao gerar resumo");
      setTxt("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // recarrega quando o período muda e já temos dados
    if (data) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, !!data]);

  return (
    <Card>
      <CardHeader className="pb-3 flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 text-primary inline-block mr-2" />
          <CardTitle>Resumo</CardTitle>
        </div>
        <Button size="sm" variant="outline" onClick={load} disabled={loading || !data}>
          {loading ? "Gerando..." : "Atualizar"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-16 w-full rounded-md" />
        ) : err ? (
          <p className="text-sm text-red-600">{err}</p>
        ) : txt ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{txt}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Clique em “Atualizar” para gerar um resumo do período.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
