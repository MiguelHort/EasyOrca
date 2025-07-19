import { FileText } from "lucide-react";
import { Item } from "@/types/orcamento";

interface ItemsListProps {
  items: Item[];
}

export function ItemsList({ items }: ItemsListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/50">
      <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <FileText className="h-5 w-5 text-gray-600" />
        Itens do Orçamento ({items.length})
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-gray-200"
          >
            <div className="flex-1">
              <span className="font-medium text-gray-900 block">{item.descricao}</span>
              <span className="text-sm text-gray-500">
                Quantidade: {item.quantidade} • Valor unitário: R$ {item.valor.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg text-green-600">
                R$ {(item.quantidade * item.valor).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}