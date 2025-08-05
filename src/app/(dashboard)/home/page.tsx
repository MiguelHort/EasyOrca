"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  FilePlus2,
  Users,
  Wrench,
  CheckCircle,
  Crown,
} from "lucide-react";
import { useUser } from '@/hooks/useUser'

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

export default function DashboardPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  const { user, isLoading, isError, errorMessage } = useUser();

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
      <SiteHeader title="Dashboard" />

      <main className="min-h-screen bg-background">
        <div className="bg-primary">
          <header className="mx-auto px-4 sm:px-6 lg:px-20 py-8 bg-gradient-to-r from-primary to-blue-400 dark:to-blue-800 text-white">
            <h1 className="text-3xl font-bold tracking-tight">
              Olá{user?.name ? `, ${user?.name}` : ""}! 👋
            </h1>
            <p className="mt-1">
              Mais um dia para fechar bons negócios com confiança!
            </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6">
              <InfoCard
                icon={<FilePlus2 className="text-primary h-6 w-6" />}
                title="Orçamentos criados"
                value={0}
                description="Este mês"
              />
              <InfoCard
                icon={<Users className="h-6 w-6 text-primary" />}
                title="Clientes cadastrados"
                value={0}
                description="Total cadastrado"
              />
              <InfoCard
                icon={<Wrench className="h-6 w-6 text-primary" />}
                title="Taxa de Conversão"
                value={0}
                description="Orçamentos aceitos"
              />
              <InfoCard
                icon={<Wrench className="h-6 w-6 text-primary" />}
                title="Valor Total"
                value={0}
                description="Em orçamentos"
              />
            </div>
          </section>

          <section className="flex flex-col md:flex-row mt-10 gap-10">
            {/* Card da esquerda: Orçamentos */}
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

            {/* Card da direita: Plano Premium */}
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
                  {[
                    "Orçamentos ilimitados",
                    "Templates premium",
                    "Integração com Pix",
                    "Relatórios avançados",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button className="w-full bg-primary text-white text-sm shadow-md">
                  Fazer parte
                </Button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  value: number | null;
  description: string;
};

function InfoCard({ icon, title, value, description }: InfoCardProps) {
  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
