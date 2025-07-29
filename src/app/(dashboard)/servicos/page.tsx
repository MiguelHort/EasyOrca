"use client";

import { useEffect, useState } from "react";
import { Wrench, BadgeDollarSign, Plus, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Servico {
  id: string;
  nome: string;
  preco: number;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchServicos();
  }, []);

  async function fetchServicos() {
    try {
      setLoading(true);
      const res = await fetch("/api/servicos", {
        credentials: "include",
      });
      const data = await res.json();
      setServicos(
        data.map((s: any) => ({
          ...s,
          preco: Number(s.preco),
        }))
      );
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim() || !preco.trim()) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetch("/api/servicos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, preco: parseFloat(preco) }),
      });

      if (!res.ok) {
        const erro = await res.json();
        alert(erro.error || "Erro ao adicionar serviço");
        return;
      }

      setNome("");
      setPreco("");
      setOpen(false);
      fetchServicos();
    } catch (err) {
      console.error("Erro ao criar serviço:", err);
      alert("Erro ao criar serviço");
    }
  }

  return (
    <>
      <SiteHeader title="Serviços" />

      <main className="p-6 max-w-4xl">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os serviços e valores que você oferece.
          </p>
        </section>

        {/* Botão de adicionar serviço via Dialog */}
        <div className="mb-6 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Serviço</DialogTitle>
                <DialogDescription>
                  Preencha os campos para registrar um novo serviço.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Troca de óleo"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="Ex: 120.00"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Salvar Serviço
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[50vh] pr-2">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : servicos.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum serviço cadastrado.
            </p>
          ) : (
            <div className="grid gap-4">
              {servicos.map((servico) => (
                <Card key={servico.id} className="hover:bg-muted transition">
                  <CardContent className="py-4 px-5 flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                        <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium">{servico.nome}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <BadgeDollarSign className="w-4 h-4" />
                          R$ {servico.preco.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </>
  );
}
