"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { usePremium } from "@/components/PremiumProvider";

import CardClient from "./CardClient";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z
    .string()
    .min(11, "Telefone deve ter pelo menos 11 caracteres")
    .optional()
    .or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

export default function ClientesPage() {
  const [clientes, setClientes] = useState<
    {
      id: string;
      nome: string;
      email: string | null;
      telefone: string | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { isPremium, resolved } = usePremium();
  const premiumLoading = !resolved;
  const MAX_CLIENTES = isPremium ? 100 : 30;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
    },
  });

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      try {
        const res = await fetch("/api/clientes");
        if (!res.ok) throw new Error("Erro ao buscar clientes");
        const data = await res.json();
        setClientes(data);
      } catch {
        alert("Erro ao carregar clientes");
      } finally {
        setLoading(false);
      }
    }
    fetchClientes();
  }, []);

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Erro ao adicionar cliente.");
      }

      const novoCliente = await res.json();
      setClientes((old) => [...old, novoCliente]);
      reset();
      setOpen(false);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar");
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
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os campos para registrar um novo cliente.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    {...register("nome")}
                    placeholder="Ex: João da Silva"
                    aria-invalid={!!errors.nome}
                    required
                  />
                  {errors.nome && (
                    <p className="text-red-600 text-sm">
                      {errors.nome.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="joao@email.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    {...register("telefone")}
                    placeholder="(11) 91234-5678"
                    aria-invalid={!!errors.telefone}
                  />
                  {errors.telefone && (
                    <p className="text-red-600 text-sm">
                      {errors.telefone.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Cliente"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lista de Clientes</h2>
            <p className="text-muted-foreground text-sm">
              {clientes.length} clientes cadastrados (restam{" "}
              {MAX_CLIENTES - clientes.length})
            </p>
          </CardHeader>
          <CardContent className="p-4">
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
                    <CardClient
                      key={cliente.id}
                      cliente={cliente}
                      onUpdate={(s) => {
                        setClientes((old) =>
                          old.map((c) =>
                            c.id === s.id ? s : c
                          )
                        );
                      }}
                      onDelete={(id) => {
                        setClientes((old) => old.filter((c) => c.id !== id));
                      }}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
