// components/CardOrcamento.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  BadgeDollarSign,
  Calendar,
  Edit2,
  Trash2,
  User,
  Info,
  MoreVertical,
  FileTextIcon,
  LayoutDashboard,
} from "lucide-react";

export type Status = "rascunho" | "enviado" | "aprovado" | "rejeitado";

export type Orcamento = {
  id: string;
  cliente: string;
  valor: number;
  data: string; // ISO
  status: Status;
  descricao?: string | null;
};

type CardOrcamentoProps = {
  orcamento: Orcamento;
  onUpdate?: (s: Orcamento) => void;
  onDelete?: (id: string) => void;
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const dateFmt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
};
const STATUS_OPTIONS: Status[] = [
  "rascunho",
  "enviado",
  "aprovado",
  "rejeitado",
];

export default function CardOrcamento({
  orcamento,
  onUpdate,
  onDelete,
}: CardOrcamentoProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [descricao, setDescricao] = useState(orcamento.descricao ?? "");
  const [valor, setValor] = useState(String(orcamento.valor).replace(".", ","));
  const [status, setStatus] = useState<Status>(orcamento.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setDescricao(orcamento.descricao ?? "");
    setValor(String(orcamento.valor).replace(".", ","));
    setStatus(orcamento.status);
  }, [orcamento]);

  async function handleSave() {
    setSaving(true);
    try {
      const valorNumber = Number(String(valor).replace(",", "."));
      if (!Number.isFinite(valorNumber) || valorNumber < 0)
        throw new Error("Valor inválido");

      const res = await fetch(`/api/orcamentos/${orcamento.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          descricao: descricao || null,
          valorTotal: valorNumber,
          status,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao atualizar orçamento");
      }
      const updated = await res.json();

      const novo: Orcamento = {
        id: updated.id ?? orcamento.id,
        cliente: updated.cliente?.nome ?? updated.cliente ?? orcamento.cliente,
        valor: Number.parseFloat(
          String(updated.valorTotal ?? updated.valor ?? valorNumber)
        ),
        data: updated.createdAt ?? updated.data ?? orcamento.data,
        status: (updated.status as Status) ?? status,
        descricao: (updated.descricao ?? descricao) || null,
      };

      onUpdate?.(novo);
      setOpen(false);
    } catch (e: any) {
      alert(e.message || "Erro ao salvar orçamento");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/orcamentos/${orcamento.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao excluir orçamento");
      }
      onDelete?.(orcamento.id);
      setOpen(false);
    } catch (e: any) {
      alert(e.message || "Erro ao excluir orçamento");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="hover:bg-muted transition flex w-full">
        <CardContent
          className="flex w-full justify-between items-center cursor-pointer pr-1"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-medium text-xs md:text-lg">{orcamento.cliente}</h3>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                <BadgeDollarSign className="w-4 h-4" />
                {currency.format(orcamento.valor)}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {dateFmt(orcamento.data)}
                <span className="mx-2">•</span>
                <span className="capitalize">{orcamento.status}</span>
              </p>
            </div>
          </div>

          {/* Controles (paramos propagação para não abrir o Dialog ao clicar neles) */}
          <AlertDialog>
            <div
              className="flex items-center gap-2 mr-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* DESKTOP: botões visíveis */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(true)}
                  aria-label="Editar orçamento"
                  title="Editar orçamento"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>

                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    aria-label="Excluir orçamento"
                    title="Excluir orçamento"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>

                <Button variant="outline" className="hidden md:flex p-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        aria-label="Ações"
                        title="Ações"
                        className="bg-blue-800 text-white hover:bg-blue-800 dark:bg-blue-700"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-44"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        className="gap-2"
                        onSelect={(e) => {
                          e.preventDefault();
                          router.push(`/orcamentos/${orcamento.id}/tipo1`);
                        }}
                      >
                        <FileTextIcon className="w-4 h-4" />
                        Orçamento Tipo 1
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="gap-2"
                        onSelect={(e) => {
                          e.preventDefault();
                          router.push(`/orcamentos/${orcamento.id}/tipo2`);
                        }}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Orçamento Tipo 2
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="gap-2"
                        onSelect={(e) => {
                          e.preventDefault();
                          router.push(`/orcamentos/${orcamento.id}/tipo3`);
                        }}
                      >
                        <FileTextIcon className="w-4 h-4" />
                        Orçamento Tipo 3
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Button>
              </div>

              {/* MOBILE: menu de 3 pontinhos */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Ações"
                      title="Ações"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-44"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      className="gap-2"
                      onSelect={(e) => {
                        e.preventDefault();
                        setOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="gap-2"
                      onSelect={(e) => {
                        e.preventDefault();
                        router.push(`/orcamentos/${orcamento.id}/tipo1`);
                      }}
                    >
                      <FileTextIcon className="w-4 h-4" />
                      Orçamento Tipo 1
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="gap-2"
                      onSelect={(e) => {
                        e.preventDefault();
                        router.push(`/orcamentos/${orcamento.id}/tipo2`);
                      }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Orçamento Tipo 2
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="gap-2"
                      onSelect={(e) => {
                        e.preventDefault();
                        router.push(`/orcamentos/${orcamento.id}/tipo3`);
                      }}
                    >
                      <FileTextIcon className="w-4 h-4" />
                      Orçamento Tipo 3
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <AlertDialogTrigger asChild>
                      <div>
                        <DropdownMenuItem
                          className="gap-2 text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </DropdownMenuItem>
                      </div>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Conteúdo do AlertDialog (compartilhado por desktop e mobile) */}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O orçamento e seus itens
                    serão removidos.
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
            <DialogTitle>Editar Orçamento</DialogTitle>
            <DialogDescription>
              Atualize os dados do orçamento e salve.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="valor">Valor Total</Label>
              <Input
                id="valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                inputMode="decimal"
                placeholder="Ex: 1.250,00"
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
