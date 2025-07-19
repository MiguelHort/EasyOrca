"use client";

import { useEffect, useState } from "react";
import { ClipboardList, FilePlus2, Users, Wrench } from "lucide-react";
import { getInfoUser } from "@/api/http/infoUser";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";

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

      <main className="flex flex-col p-6 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Olá{userName ? `, ${userName}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está um resumo da sua conta.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard
            icon={<FilePlus2 className="text-primary h-5 w-5" />}
            title="Orçamentos criados"
            value={orcamentoCount}
          />
          <InfoCard
            icon={<Users className="text-purple-600 h-5 w-5" />}
            title="Clientes cadastrados"
            value={clientesCount}
          />
          <InfoCard
            icon={<Wrench className="text-orange-600 h-5 w-5" />}
            title="Serviços disponíveis"
            value={servicosCount}
          />
        </div>

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
            Mantenha seus dados sempre atualizados para um melhor desempenho da plataforma.
          </CardContent>
        </Card>
      </main>
    </>
  );
}

type InfoCardProps = {
  icon: React.ReactNode;
  title: string;
  value: number | null;
};

function InfoCard({ icon, title, value }: InfoCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value !== null ? value : <Skeleton className="h-6 w-12" />}
        </div>
      </CardContent>
    </Card>
  );
}
