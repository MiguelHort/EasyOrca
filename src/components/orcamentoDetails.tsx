import { DollarSign, Hash, Calendar } from "lucide-react";
import { Orcamento } from "@/types/orcamento";

interface OrcamentoDetailsProps {
  orcamento: Orcamento;
}

export function OrcamentoDetails({ orcamento }: OrcamentoDetailsProps) {
  const formatDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString("pt-BR");
    } catch {
      return date;
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200/50">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">Detalhes do Orçamento</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 text-sm">Número:</span>
          <span className="font-medium text-gray-900">#{orcamento.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600 text-sm">Data:</span>
          <span className="font-medium text-gray-900">{formatDate(orcamento.data)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Valor Total:</span>
          <span className="font-bold text-2xl text-green-600">
            R$ {orcamento.valor.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}