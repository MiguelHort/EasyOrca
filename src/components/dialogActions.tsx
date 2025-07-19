import { Button } from "@/components/ui/button";
import { Download, MessageCircle } from "lucide-react";

interface DialogActionsProps {
  onGeneratePDF: () => void;
  onSendWhatsApp: () => void;
  isGeneratingPDF: boolean;
  lastPdfLink: string | null;
}

export function DialogActions({
  onGeneratePDF,
  onSendWhatsApp,
  isGeneratingPDF,
  lastPdfLink,
}: DialogActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Button
        onClick={onGeneratePDF}
        disabled={isGeneratingPDF}
        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isGeneratingPDF ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            Gerando PDF...
          </>
        ) : (
          <>
            <Download className="h-5 w-5 mr-2" />
            Gerar PDF
          </>
        )}
      </Button>
      
      {lastPdfLink && (
        <Button
          onClick={onSendWhatsApp}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
          <MessageCircle className="h-5 w-5 mr-2 relative z-10" />
          <span className="relative z-10">Enviar por WhatsApp</span>
        </Button>
      )}
    </div>
  );
}