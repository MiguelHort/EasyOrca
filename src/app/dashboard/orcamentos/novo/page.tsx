"use client";

import { useEffect, useState } from "react";
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

interface Cliente {
  id: string;
  nome: string;
}

export default function NovoOrcamentoPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchClientes() {
      try {
        const res = await fetch("/api/clientes", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Erro ao buscar clientes");

        const data = await res.json();
        setClientes(data);
        setClienteId(data[0]?.id || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const valor = parseFloat(valorTotal);
    if (!clienteId || !valor || isNaN(valor)) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    try {
      const res = await fetch("/api/orcamentos/novo", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId, descricao, valorTotal: valor }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao criar orçamento");
        return;
      }

      router.push("/dashboard/orcamentos");
    } catch (err) {
      console.error(err);
      alert("Erro inesperado ao criar orçamento.");
    }
  }

  return (
    <>
      <SiteHeader title="Novo Orçamento" />

      <main className="p-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Novo Orçamento</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para gerar o orçamento.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="grid gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid gap-5">
                {/* Cliente */}
                <div className="grid gap-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <select
                    id="cliente"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descrição */}
                <div className="grid gap-2">
                  <Label htmlFor="descricao">Descrição dos serviços</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Instalação elétrica, troca de tomada..."
                    rows={4}
                  />
                </div>

                {/* Valor */}
                <div className="grid gap-2">
                  <Label htmlFor="valor">Valor total (R$)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                    placeholder="Ex: 250.00"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Gerar Orçamento
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
