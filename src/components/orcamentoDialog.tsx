import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Orcamento } from "@/types/orcamento";
import { ClienteInfo } from "@/components/clienteInfo";
import { OrcamentoDetails } from "@/components/orcamentoDetails";
import { ItemsList } from "@/components/itemsList";
import { DialogActions } from "@/components/dialogActions";

interface OrcamentoDialogProps {
  orcamento: Orcamento | null;
  isOpen: boolean;
  onClose: () => void;
  onGeneratePDF: () => void;
  onSendWhatsApp: () => void;
  isGeneratingPDF: boolean;
  lastPdfLink: string | null;
}

export function OrcamentoDialog({
  orcamento,
  isOpen,
  onClose,
  onGeneratePDF,
  onSendWhatsApp,
  isGeneratingPDF,
  lastPdfLink,
}: OrcamentoDialogProps) {
  if (!orcamento) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-0 shadow-2xl">
        <DialogHeader className="border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Orçamento #{orcamento.id}
                <Badge
                  variant={getBadgeVariant(orcamento.status)}
                  className="px-3 py-1 font-medium"
                >
                  {orcamento.status}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base mt-1">
                {orcamento.cliente} • {formatDate(orcamento.data)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-8 py-6">
          <div className="flex flex-col gap-6">
            <ClienteInfo orcamento={orcamento} />
            <OrcamentoDetails orcamento={orcamento} />
          </div>
          <ItemsList items={orcamento.itens || []} />
        </div>
        
        <DialogFooter className="border-t border-gray-100 pt-6">
          <DialogActions
            onGeneratePDF={onGeneratePDF}
            onSendWhatsApp={onSendWhatsApp}
            isGeneratingPDF={isGeneratingPDF}
            lastPdfLink={lastPdfLink}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}