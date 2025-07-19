import { useCallback } from "react";
import { toast } from "sonner";
import { Orcamento } from "@/types/orcamento";

export function useWhatsApp() {
  const sendWhatsApp = useCallback((orcamento: Orcamento, pdfLink: string) => {
    if (!orcamento || !pdfLink) return;

    const numeroCliente = orcamento.telefone 
      ? orcamento.telefone.replace(/\D/g, '') 
      : '';

    const mensagem = `Olá ${orcamento.cliente}! 

Segue o orçamento #${orcamento.id} no valor de R$ ${orcamento.valor.toFixed(2)}.

Você pode visualizar o PDF aqui: ${pdfLink}

Qualquer dúvida, estou à disposição!`;

    const mensagemEncoded = encodeURIComponent(mensagem);
    
    let whatsappUrl;
    if (numeroCliente) {
      whatsappUrl = `whatsapp://send?phone=${numeroCliente}&text=${mensagemEncoded}`;
    } else {
      whatsappUrl = `whatsapp://send?text=${mensagemEncoded}`;
    }

    window.location.href = whatsappUrl;
    
    toast("Abrindo WhatsApp!", {
      description: numeroCliente 
        ? `Enviando para ${orcamento.telefone}` 
        : "Escolha o contato no WhatsApp",
    });
  }, []);

  return { sendWhatsApp };
}