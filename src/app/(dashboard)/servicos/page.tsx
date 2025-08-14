"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Wrench, BadgeDollarSign } from "lucide-react";

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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { usePremium } from "@/components/PremiumProvider";

import CardService from "./CardService";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  preco: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine((v) => !Number.isNaN(parseFloat(v)), "Preço inválido"),
});

type FormData = z.infer<typeof formSchema>;

type Servico = {
  id: string;
  nome: string;
  preco: number;
};

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { isPremium, loading: premiumLoading } = usePremium();
  const MAX_SERVIÇOS = isPremium ? 100 : 20;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { nome: "", preco: "" },
  });

  useEffect(() => {
    fetchServicos();
  }, []);

  async function fetchServicos() {
    try {
      setLoading(true);
      const res = await fetch("/api/servicos", { credentials: "include" });
      if (!res.ok) throw new Error("Erro ao buscar serviços");
      const data = await res.json();
      setServicos(data.map((s: any) => ({ ...s, preco: Number(s.preco) })));
    } catch {
      alert("Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/servicos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          preco: parseFloat(data.preco),
        }),
      });

      if (!res.ok) {
        const erro = await res.json().catch(() => ({}));
        throw new Error(erro.error || "Erro ao adicionar serviço");
      }

      const novo = await res.json();
      setServicos((old) => [...old, { ...novo, preco: Number(novo.preco) }]);
      reset();
      setOpen(false);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar");
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
                <DialogTitle>Novo Serviço</DialogTitle>
                <DialogDescription>
                  Preencha os campos para registrar um novo serviço.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Troca de óleo"
                    aria-invalid={!!errors.nome}
                    {...register("nome")}
                    required
                  />
                  {errors.nome && (
                    <p className="text-red-600 text-sm">
                      {errors.nome.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 120.00"
                    aria-invalid={!!errors.preco}
                    {...register("preco")}
                    required
                  />
                  {errors.preco && (
                    <p className="text-red-600 text-sm">
                      {errors.preco.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Serviço"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lista de Serviços</h2>
            <p className="text-muted-foreground text-sm">
              {servicos.length} serviços cadastrados (restam{" "}
              {MAX_SERVIÇOS - servicos.length})
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
              ) : servicos.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum serviço cadastrado.
                </p>
              ) : (
                <div className="grid gap-4">
                  {servicos.map((servico) => (
                    <CardService
                      key={servico.id}
                      servico={servico}
                      onUpdate={(s) =>
                        setServicos((old) =>
                          old.map((it) => (it.id === s.id ? s : it))
                        )
                      }
                      onDelete={(id) =>
                        setServicos((old) => old.filter((it) => it.id !== id))
                      }
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
