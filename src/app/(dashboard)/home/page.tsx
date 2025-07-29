"use client";

import { useEffect, useState } from "react";
import { ClipboardList, FilePlus2, Users, Wrench } from "lucide-react";
import { getInfoUser } from "@/lib/services/infoUser";

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

export default function DashboardPage() {
  const [userName, setUserName] = useState("");
  const [orcamentoCount, setOrcamentoCount] = useState<number | null>(null);
  const [clientesCount, setClientesCount] = useState<number | null>(null);
  const [servicosCount, setServicosCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getInfoUser();
        setUserName(user?.name || "");
        setOrcamentoCount(user?.orcamentoCount ?? 0);
        setClientesCount(user?.clienteCount ?? 0);
        setServicosCount(user?.servicoCount ?? 0);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    }

    fetchUser();
  }, []);

  return (
    <>
      <SiteHeader title="Dashboard" />

      <main className="min-h-screen bg-background">
        <div className="bg-primary">
          <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-r from-primary to-blue-400 text-white">
            <h1 className="text-3xl font-bold tracking-tight">
              Olá{userName ? `, ${userName}` : ""}! 👋
            </h1>
            <p className="mt-1">Aqui está um resumo da sua conta.</p>
          </header>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Acesso Rápido</h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/orcamentos">
                <Button variant={"outline"} className="border-lime-400 border-2 hover:bg-lime-200 dark:border-lime-400 cursor-pointer">
                  <FilePlus2 className="h-5 w-5" />
                  Orçamentos
                </Button>
              </Link>
              <Link href="/clientes">
                <Button variant={"outline"} className="border-purple-400 border-2 hover:bg-purple-200 dark:border-purple-400 cursor-pointer">
                  <Users className="h-5 w-5" />
                  Clientes
                </Button>
              </Link>
              <Link href="/servicos">
                <Button variant={"outline"} className="border-red-400 border-2 hover:bg-red-200 dark:border-red-400 cursor-pointer">
                  <Wrench className="h-5 w-5" />
                  Serviços
                </Button>
              </Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Estatísticas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoCard
                icon={<FilePlus2 className="text-primary h-6 w-6" />}
                title="Orçamentos criados"
                value={orcamentoCount}
                description="Total de orçamentos que você criou."
              />
              <InfoCard
                icon={<Users className="h-6 w-6 text-purple-600" />}
                title="Clientes cadastrados"
                value={clientesCount}
                description="Total de clientes que você cadastrou."
              />
              <InfoCard
                icon={<Wrench className="h-6 w-6 text-red-600" />}
                title="Serviços disponíveis"
                value={servicosCount}
                description="Total de serviços que você cadastrou."
              />
            </div>
          </section>

          <Card className="mt-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-blue-500" />
                Detalhes da Conta
              </CardTitle>
              <CardDescription>
                Resumo geral das informações que você possui no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Mantenha seus dados sempre atualizados para um melhor desempenho
              da plataforma.
            </CardContent>
          </Card>
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
