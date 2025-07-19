import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ChevronRight } from "lucide-react";
import { Orcamento } from "@/types/orcamento";

interface OrcamentoCardProps {
  orcamento: Orcamento;
  onViewDetails: (orcamento: Orcamento) => void;
}

export function OrcamentoCard({ orcamento, onViewDetails }: OrcamentoCardProps) {
  const formatDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString("pt-BR");
    } catch {
      return date;
    }
  };

  const getBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    const s = status.toLowerCase();
    if (s === "aprovado") return "default";
    if (s === "pendente") return "secondary";
    if (s === "rejeitado") return "destructive";
    return "outline";
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-r from-white to-gray-50/30">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row md:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {orcamento.cliente}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {formatDate(orcamento.data)} • R${" "}
                <span className="text-green-600 font-semibold">
                  {orcamento.valor.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge 
              variant={getBadgeVariant(orcamento.status)}
              className="px-3 py-1 font-medium"
            >
              {orcamento.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(orcamento)}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
            >
              Ver detalhes
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}