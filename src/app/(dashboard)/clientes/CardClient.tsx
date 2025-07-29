"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, ChevronRight } from "lucide-react";

export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
}

type CardClientProps = {
  cliente: Cliente;
  onClick?: () => void;
};

export default function CardClient({ cliente, onClick }: CardClientProps) {
  return (
    <Card className="hover:bg-muted transition" onClick={onClick}>
      <CardContent className="py-4 px-5 flex items-center justify-between">
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
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}
