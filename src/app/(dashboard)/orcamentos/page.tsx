"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { OrcamentoCard } from "@/components/orcamentoCard";
import { OrcamentoDialog } from "@/components/orcamentoDialog";
import { FloatingWidget } from "@/components/floatingWidget";
import { usePDFGenerator } from "@/hooks/usePDFGenerator";
import { useWhatsApp } from "@/hooks/useWhatsApp";
import { Orcamento, User } from "@/types/orcamento";
import { useUserInfo } from "@/hooks/useUserInfo";

export default function HistoricoOrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Hook para dados do usuário
  const user: User = useUserInfo();

  const { generatePDF, isGeneratingPDF, lastPdfLink, setLastPdfLink } = usePDFGenerator();
  const { sendWhatsApp } = useWhatsApp();

  const fetchOrcamentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: substituir pelo fetch real da sua API
      const mockOrcamentos: Orcamento[] = [
        {
          id: "001",
          cliente: "João Silva",
          valor: 2500.0,
          data: "2024-01-15",
          status: "Aprovado",
          cnpj: "12.345.678/0001-90",
          endereco: "Rua das Flores, 123",
          cidade: "São Paulo",
          telefone: "(11) 99999-9999",
          email: "joao@email.com",
          itens: [
            { descricao: "Produto A", quantidade: 2, valor: 1000.0 },
            { descricao: "Produto B", quantidade: 1, valor: 500.0 },
          ],
        },
        {
          id: "002",
          cliente: "Maria Santos",
          valor: 1800.0,
          data: "2024-01-20",
          status: "Pendente",
          cnpj: "98.765.432/0001-10",
          endereco: "Av. Central, 456",
          cidade: "Rio de Janeiro",
          telefone: "(21) 88888-8888",
          email: "maria@email.com",
          itens: [{ descricao: "Serviço X", quantidade: 3, valor: 600.0 }],
        },
      ];

      setOrcamentos(mockOrcamentos);
    } catch (err) {
      console.error("Erro ao carregar orçamentos:", err);
      setError("Erro ao carregar orçamentos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrcamentos();
  }, [fetchOrcamentos]);

  const handleViewDetails = useCallback(
    (orcamento: Orcamento) => {
      setOrcamentoSelecionado(orcamento);
      setDialogOpen(true);
      setLastPdfLink(null);
    },
    [setLastPdfLink]
  );

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setOrcamentoSelecionado(null);
  }, []);

  const handleGeneratePDF = useCallback(async () => {
    if (!orcamentoSelecionado) return;
    await generatePDF(orcamentoSelecionado, user);
  }, [orcamentoSelecionado, user, generatePDF]);

  const handleSendWhatsApp = useCallback(() => {
    if (!orcamentoSelecionado || !lastPdfLink) return;
    sendWhatsApp(orcamentoSelecionado, lastPdfLink);
  }, [orcamentoSelecionado, lastPdfLink, sendWhatsApp]);

  const handleRetry = useCallback(() => {
    fetchOrcamentos();
  }, [fetchOrcamentos]);

  const pageBg =
    "min-h-screen from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900";

  if (loading) {
    return (
      <div className={pageBg}>
        <SiteHeader title="Orçamentos" />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-0 bg-white/50 dark:bg-gray-800/40">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={pageBg}>
        <SiteHeader title="Orçamentos" />
        <div className="container mx-auto px-4 py-8">
          <Alert className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-400/40">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={handleRetry} className="mt-4">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={pageBg}>
      <SiteHeader title="Orçamentos" />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Histórico de Orçamentos</h1>
          <p className="text-gray-600 dark:text-gray-400">Visualize e gerencie seus orçamentos criados</p>
        </div>

        {orcamentos.length === 0 ? (
          <Card className="border-0 bg-white/50 dark:bg-gray-800/40 text-center py-12">
            <CardContent>
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum orçamento encontrado</h3>
                <p>Você ainda não possui orçamentos criados.</p>
              </div>
              <Button onClick={handleRetry} variant="outline">
                Atualizar lista
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orcamentos.map((orcamento) => (
              <OrcamentoCard key={orcamento.id} orcamento={orcamento} onViewDetails={handleViewDetails} />
            ))}
          </div>
        )}
      </div>

      <OrcamentoDialog
        orcamento={orcamentoSelecionado}
        isOpen={dialogOpen}
        onClose={handleCloseDialog}
        onGeneratePDF={handleGeneratePDF}
        onSendWhatsApp={handleSendWhatsApp}
        isGeneratingPDF={isGeneratingPDF}
        lastPdfLink={lastPdfLink}
      />

      <FloatingWidget lastPdfLink={lastPdfLink} onSendWhatsApp={handleSendWhatsApp} />
    </div>
  );
}
