"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";

type EmpresaInfo = {
  name: string;
  image: string | null;
};

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/infoCompany")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados da empresa");
        return res.json();
      })
      .then((data) =>
        setEmpresa({
          name: data.name,
          image: data.image,
        })
      )
      .catch((err) => {
        console.error(err);
        setEmpresa(null); // fallback padrão
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col p-6 gap-3">
        <Card className="p-6 mx-auto min-w-sm max-w-3xl">
          <Skeleton className="h-20 w-24 rounded-md" />
          <Skeleton className="h-6 w-1/2 mt-4" />
          <Skeleton className="h-4 w-1/3 mt-2" />
        </Card>
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Minha Empresa" />

      <main className="p-6 max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 flex gap-4 items-center">
            {empresa?.image ? (
              <img
                src={`/api/user/companyImage?file=${empresa.image}`}
                alt="Logo da empresa"
                className="w-24 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-20 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                Sem logo
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium">{empresa?.name}</h3>
              <Badge className="mt-2">Empresa Ativa</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
