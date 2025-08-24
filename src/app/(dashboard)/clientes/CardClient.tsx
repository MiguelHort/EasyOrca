"use client";

import React, { useEffect, useState } from "react";
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
import { Edit2, Trash2, User, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export type Cliente = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
};

export type CardClienteProps = {
  cliente: Cliente;
  onUpdate?: (atualizado: Cliente) => void;
  onDelete?: (id: string) => void;
};

const CardCliente: React.FC<CardClienteProps> = ({ cliente, onUpdate, onDelete }) => {
  const [open, setOpen] = useState(false);

  const [nome, setNome] = useState(cliente.nome ?? "");
  const [email, setEmail] = useState(cliente.email ?? "");
  const [telefone, setTelefone] = useState(cliente.telefone ?? "");

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setNome(cliente.nome ?? "");
    setEmail(cliente.email ?? "");
    setTelefone(cliente.telefone ?? "");
  }, [cliente]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        nome: (nome || "").trim(),
        email: (email || "").trim() || null,
        telefone: (telefone || "").trim() || null,
      };

      if (!payload.nome) throw new Error("O nome é obrigatório.");

      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao atualizar cliente");
      }

      const updated = (await res.json()) as Partial<Cliente>;

      const novo: Cliente = {
        id: updated.id ?? cliente.id,
        nome: updated.nome ?? payload.nome!,
        email: updated.email ?? payload.email ?? null,
        telefone: updated.telefone ?? payload.telefone ?? null,
      };

      onUpdate?.(novo);
      setOpen(false);
    } catch (e: any) {
      alert(e.message || "Erro ao salvar cliente");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Erro ao excluir cliente");
      }
      onDelete?.(cliente.id);
      setOpen(false);
    } catch (e: any) {
      alert(e.message || "Erro ao excluir cliente");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="hover:bg-muted transition">
        <CardContent
          className="flex w-full justify-between items-center cursor-pointer py-4 pr-1"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="space-y-1">
              <h3 className="font-medium">{cliente.nome}</h3>
              <p className="text-sm text-muted-foreground">
                {cliente.email || "sem e-mail"}
              </p>
              <p className="text-xs text-muted-foreground">
                {cliente.telefone || "sem telefone"}
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
                  <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. O cliente será removido.
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
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>Atualize os dados do cliente e salve.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label htmlFor="nome">Nome*</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
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
};

export default CardCliente;
