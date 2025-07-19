import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface FloatingWidgetProps {
  lastPdfLink: string | null;
  onSendWhatsApp: () => void;
}

export function FloatingWidget({ lastPdfLink, onSendWhatsApp }: FloatingWidgetProps) {
  if (!lastPdfLink) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 p-4 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">PDF gerado com sucesso!</span>
      </div>
      
      <Button
        size="sm"
        onClick={onSendWhatsApp}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Enviar por WhatsApp
      </Button>
    </div>
  );
}