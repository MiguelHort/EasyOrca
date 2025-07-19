import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Orcamento, User } from "@/types/orcamento";

export function usePDFGenerator() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [lastPdfLink, setLastPdfLink] = useState<string | null>(null);

  const toBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const formatDate = (date: string): string => {
    try {
      return new Date(date).toLocaleDateString("pt-BR");
    } catch {
      return date;
    }
  };

  const generatePDF = useCallback(async (orcamento: Orcamento, user: User) => {
    setIsGeneratingPDF(true);
    setLastPdfLink(null);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Logo
      let logoBase64 = "";
      if (user.companyImage) {
        try {
          const res = await fetch(
            `/api/user/companyImage?file=${encodeURIComponent(user.companyImage)}`
          );
          if (res.ok) {
            const blob = await res.blob();
            logoBase64 = await toBase64(blob);
          }
        } catch (err) {
          console.warn("Erro ao carregar logo:", err);
        }
      }

      if (logoBase64) {
        pdf.addImage(logoBase64, "JPEG", 10, 10, 30, 15);
      }

      // Título
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(0, 51, 102);
      pdf.text("ORÇAMENTO", logoBase64 ? 50 : 10, 20);

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(`#${orcamento.id}`, pageWidth - 60, 15);
      pdf.text(`Data: ${formatDate(orcamento.data)}`, pageWidth - 60, 20);

      // Cliente
      let y = 35;
      if (user.companyName) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(user.companyName, 10, y);
        y += 8;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(0, 51, 102);
      pdf.text("DADOS DO CLIENTE", 10, (y += 5));

      const infoCliente: [string, string][] = [
        ["Cliente:", orcamento.cliente],
        ["CNPJ:", orcamento.cnpj],
        ["Endereço:", orcamento.endereco],
        ["Cidade:", orcamento.cidade],
        ["Telefone:", orcamento.telefone],
        ["E‑mail:", orcamento.email],
      ].filter(([, value]) => value && value.trim() !== "") as [string, string][];

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);

      infoCliente.forEach(([label, value]) => {
        y += 6;
        pdf.setFont("helvetica", "bold");
        pdf.text(label, 10, y);
        pdf.setFont("helvetica", "normal");
        pdf.text(value, 40, y);
      });

      // Itens
      y += 10;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(0, 51, 102);
      pdf.text("ITENS DO ORÇAMENTO", 10, y);
      y += 8;

      // Cabeçalho da tabela
      pdf.setFillColor(240, 240, 240);
      pdf.rect(10, y - 2, pageWidth - 20, 8, "F");
      pdf.setFontSize(10).setFont("helvetica", "bold").setTextColor(0, 0, 0);
      pdf.text("DESCRIÇÃO", 12, y + 3);
      pdf.text("QTD", 130, y + 3);
      pdf.text("VALOR UNIT.", 150, y + 3);
      pdf.text("TOTAL", 180, y + 3);
      y += 10;

      let total = 0;
      const rows = orcamento.itens || [];

      rows.forEach((item, i) => {
        const itemTotal = (item.valor || 0) * (item.quantidade || 0);
        total += itemTotal;

        if (i % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(10, y - 2, pageWidth - 20, 6, "F");
        }

        pdf.setFont("helvetica", "normal");
        pdf.text(item.descricao || "", 12, y + 2);
        pdf.text(String(item.quantidade || 0), 135, y + 2);
        pdf.text(`R$ ${(item.valor || 0).toFixed(2)}`, 152, y + 2);
        pdf.text(`R$ ${itemTotal.toFixed(2)}`, 182, y + 2);
        y += 8;
      });

      pdf.setLineWidth(0.5).setDrawColor(0, 51, 102).line(10, y, pageWidth - 10, y);

      // Total
      y += 8;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(0, 51, 102);
      pdf.text(`TOTAL GERAL: R$ ${total.toFixed(2)}`, pageWidth - 80, y);

      // Status
      y += 8;
      pdf.setFontSize(10).setTextColor(0, 0, 0);
      pdf.text(`Status: ${orcamento.status}`, 10, y);

      // Rodapé
      const footerY = pageHeight - 20;
      pdf.setFont("helvetica", "normal").setFontSize(8).setTextColor(100, 100, 100);
      pdf.text("Gerado por EasyOrça - Cosmic Tech", 10, footerY);
      pdf.text(new Date().toLocaleString("pt-BR"), pageWidth - 60, footerY);

      // Upload
      const blob = pdf.output("blob");
      const filename = `orca-pdfs/orcamento-${orcamento.id}-${Date.now()}.pdf`;

      const { error: uploadErr } = await supabase.storage
        .from("easyorca-pdf")
        .upload(filename, blob, {
          contentType: "application/pdf",
          upsert: false,
          cacheControl: "3600",
        });

      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("easyorca-pdf")
        .getPublicUrl(filename);

      setLastPdfLink(publicUrl);

      try {
        await navigator.clipboard.writeText(publicUrl);
        toast("PDF enviado para o Supabase!", {
          description: "Link copiado para a área de transferência.",
          action: {
            label: "Abrir",
            onClick: () => window.open(publicUrl, "_blank"),
          },
        });
      } catch (clipboardErr) {
        toast("PDF enviado para o Supabase!", {
          description: "Clique no botão para copiar o link.",
          action: {
            label: "Abrir",
            onClick: () => window.open(publicUrl, "_blank"),
          },
        });
      }
    } catch (err) {
      console.error("Erro ao gerar/enviar PDF:", err);
      toast("Erro ao gerar ou enviar PDF", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  }, []);

  return {
    generatePDF,
    isGeneratingPDF,
    lastPdfLink,
    setLastPdfLink,
  };
}