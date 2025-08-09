"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, ChevronRight, Edit2, X } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type CardClientProps = {
  cliente: {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
  };
  onUpdate?: (clienteAtualizado: {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
  }) => void;
};

export default function CardClient({ cliente, onUpdate }: CardClientProps) {
  const [open, setOpen] = useState(false);

  const [nome, setNome] = useState(cliente.nome);
  const [email, setEmail] = useState(cliente.email ?? "");
  const [telefone, setTelefone] = useState(cliente.telefone ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNome(cliente.nome);
    setEmail(cliente.email ?? "");
    setTelefone(cliente.telefone ?? "");
  }, [cliente]);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/clientes/${cliente.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nome, email, telefone }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || "Erro ao atualizar cliente");
      }
      const atualizado = await res.json();
      onUpdate?.(atualizado);
      setOpen(false);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card className="hover:bg-muted transition flex">
        <CardContent
          className="flex justify-between items-center"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-muted rounded-full">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">{cliente.nome}</h3>
              {cliente.telefone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {cliente.telefone}
                </p>
              )}
              {cliente.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {cliente.email}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mr-2"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            aria-label="Editar cliente"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Altere as informações do cliente e salve.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
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
          <DialogFooter className="flex gap-2">
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
