"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, BadgeDollarSign, Edit2, Trash2, MoreVertical } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type CardServiceProps = {
  servico: { id: string; nome: string; preco: number };
  onUpdate?: (s: { id: string; nome: string; preco: number }) => void;
  onDelete?: (id: string) => void;
};

export default function CardService({ servico, onUpdate, onDelete }: CardServiceProps) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState(servico.nome);
  const [preco, setPreco] = useState(String(servico.preco).replace(".", ","));
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setNome(servico.nome);
    setPreco(String(servico.preco).replace(".", ","));
  }, [servico]);

  async function handleSave() {
    setLoading(true);
    try {
      const precoNumber = Number(preco.replace(",", "."));
      if (Number.isNaN(precoNumber)) throw new Error("Preço inválido");

      const res = await fetch(`/api/servicos/${servico.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome, preco: precoNumber }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao atualizar serviço");
      }
      const atualizado = await res.json();
      onUpdate?.({ ...atualizado, preco: Number(atualizado.preco) });
      setOpen(false);
    } catch (e: any) {
      alert(e.message || "Erro ao salvar serviço");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/servicos/${servico.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao excluir serviço");
      }
      onDelete?.(servico.id);
      setOpen(false);
    } catch (e: any) {
      alert(e.message || "Erro ao excluir serviço");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="hover:bg-muted transition flex">
        <CardContent
          className="flex justify-between items-center pr-1"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">{servico.nome}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <BadgeDollarSign className="w-4 h-4" />
                {currency.format(servico.preco)}
              </p>
            </div>
          </div>

          <AlertDialog>
            <div
              className="flex items-center gap-2 mr-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                  <Edit2 className="w-4 h-4" />
                </Button>

                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
              </div>

              {/* Mobile */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Editar
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <AlertDialogTrigger asChild>
                      <div>
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" /> Excluir
                        </DropdownMenuItem>
                      </div>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir serviço?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O serviço será removido.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete}>
                    {deleting ? "Excluindo..." : "Confirmar exclusão"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </div>
          </AlertDialog>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
            <DialogDescription>Altere as informações do serviço e salve.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="preco">Preço</Label>
              <Input
                id="preco"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                inputMode="decimal"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
