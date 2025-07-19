import { User, Building, Phone, Mail, MapPin } from "lucide-react";
import { Orcamento } from "@/types/orcamento";

interface ClienteInfoProps {
  orcamento: Orcamento;
}

export function ClienteInfo({ orcamento }: ClienteInfoProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/50">
      <div className="flex items-center gap-3 mb-4">
        <User className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Informações do Cliente</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 text-sm">Nome:</span>
          <span className="font-medium text-gray-900">{orcamento.cliente}</span>
        </div>
        {orcamento.cnpj && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 text-sm">CNPJ:</span>
            <span className="font-medium text-gray-900">{orcamento.cnpj}</span>
          </div>
        )}
        {orcamento.telefone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 text-sm">Telefone:</span>
            <span className="font-medium text-gray-900">{orcamento.telefone}</span>
          </div>
        )}
        {orcamento.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 text-sm">E-mail:</span>
            <span className="font-medium text-gray-900">{orcamento.email}</span>
          </div>
        )}
        {(orcamento.endereco || orcamento.cidade) && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600 text-sm">Endereço:</span>
            <span className="font-medium text-gray-900">
              {orcamento.endereco}{orcamento.endereco && orcamento.cidade && ', '}{orcamento.cidade}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}