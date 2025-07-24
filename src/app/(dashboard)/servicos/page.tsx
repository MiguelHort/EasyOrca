"use client";

import { Wrench, BadgeDollarSign, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ServicosPage() {
  const servicos = [
    {
      id: "1",
      nome: "Instalação elétrica",
      valor: 150.0,
    },
    {
      id: "2",
      nome: "Desentupimento",
      valor: 200.0,
    },
  ];

  return (
    <>
      <SiteHeader title="Serviços" />

      <main className="p-6 max-w-3xl">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os serviços e valores que você oferece.
          </p>
        </section>

        <div className="grid gap-4">
          {servicos.map((servico) => (
            <Card key={servico.id} className="hover:bg-muted transition-colors">
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                    <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="font-medium">{servico.nome}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <BadgeDollarSign className="w-4 h-4" />
                      R$ {servico.valor.toFixed(2)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
