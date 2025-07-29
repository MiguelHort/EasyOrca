"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText, User, Calendar, DollarSign, ChevronRight } from "lucide-react";

export interface Orcamento {
  id: string;
  cliente: string;
  valor: number;
  data: string;   // ISO date ou string legível
  status: "rascunho" | "enviado" | "aprovado" | "cancelado" | string;
}

type Props = {
  orcamento: Orcamento;
  onClick?: () => void;
};

function formatCurrencyBRL(v: number) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v ?? 0);
  } catch {
    return `R$ ${Number(v ?? 0).toFixed(2)}`;
  }
}

function formatDateBR(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr || "-";
  return d.toLocaleDateString("pt-BR");
}

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case "enviado":
      return "text-blue-600";
    case "aprovado":
      return "text-green-600";
    case "cancelado":
      return "text-red-600";
    case "rascunho":
      return "text-muted-foreground";
    default:
      return "text-foreground";
  }
}

export default function CardOrcamento({ orcamento, onClick }: Props) {
  const { cliente, valor, data, status } = orcamento;

  return (
    <Card className="hover:bg-muted transition" onClick={onClick}>
      <CardContent className="py-4 px-5 flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-muted rounded-full">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">{cliente}</h3>

            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="w-4 h-4" />
              Cliente: {cliente}
            </p>

            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Valor: {formatCurrencyBRL(valor)}
            </p>

            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Data: {formatDateBR(data)}
            </p>

            <p className={`text-sm font-semibold ${statusClass(status)}`}>
              Status: {status}
            </p>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
