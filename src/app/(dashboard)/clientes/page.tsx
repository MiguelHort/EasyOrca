"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

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

import CardClient, { Cliente } from "./CardClient";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    try {
      setLoading(true);
      const res = await fetch("/api/clientes", {
        credentials: "include",
      });
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone }),
      });

      if (!res.ok) {
        const erro = await res.json();
        alert(erro.error || "Erro ao adicionar cliente");
        return;
      }

      setNome("");
      setEmail("");
      setTelefone("");
      setOpen(false);
      fetchClientes();
    } catch (err) {
      console.error("Erro ao criar cliente:", err);
      alert("Erro ao criar cliente");
    }
  }

  return (
    <>
      <SiteHeader title="Clientes" />

      <main className="p-6 max-w-4xl">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os clientes que você atende.
          </p>
        </section>

        {/* Botão de adicionar cliente via Dialog */}
        <div className="mb-6 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os campos para registrar um novo cliente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: João da Silva"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="joao@email.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 91234-5678"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Salvar Cliente
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
          ) : clientes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nenhum cliente cadastrado.
            </p>
          ) : (
            <div className="grid gap-4">
              {clientes.map((cliente) => (
                <CardClient key={cliente.id} cliente={cliente} />
              ))}
            </div>
          )}
        </ScrollArea>
      </main>
    </>
  );
}
