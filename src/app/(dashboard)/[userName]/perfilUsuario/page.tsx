"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";

type UserInfo = {
  id: string;
  name: string;
  email: string;
  profileImage: string | null;
  userName: string;
  companyName: string;
  companyImage: string | null;
  phone: string;
  orcamentoCount: number;
  clienteCount: number;
  servicoCount: number;
};

export default function MinhaContaPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/infoUser")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar usuário");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col p-6 gap-3">
        <Card className="p-6 mx-auto min-w-sm max-w-3xl">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </Card>
        <Card className="p-6 mx-auto min-w-sm max-w-3xl">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </Card>
      </div>
    );
  }

  if (!user) {
    return <div className="p-6 text-red-500">Erro ao carregar usuário.</div>;
  }

  return (
    <>

      <SiteHeader title="Minha Conta" />

      <main className="p-6 max-w-3xl mx-auto space-y-6">

      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={`/api/user/profileImage?file=${user.profileImage}`}
              alt={user.name}
            />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>

          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">@{user.userName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">{user.phone}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex gap-4 items-center">
          {user.companyImage && (
            <img
              src={`/api/user/companyImage?file=${user.companyImage}`}
              alt="Logo da empresa"
              className="w-24 h-20 rounded-lg object-cover"
            />
          )}

          <div>
            <h3 className="text-lg font-medium">{user.companyName}</h3>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">Orçamentos: {user.orcamentoCount}</Badge>
              <Badge variant="outline">Clientes: {user.clienteCount}</Badge>
              <Badge variant="outline">Serviços: {user.servicoCount}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </main> 
    </>
  );
}
