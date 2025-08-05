"use client";

import { CheckCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default function AssinarPlanoPage() {
  const handleSubscribe = async () => {
    // Aqui você pode chamar sua API de assinatura (ex: Stripe, PagSeguro, etc.)
    alert("Assinatura iniciada!");
  };

  return (
    <>
      <SiteHeader title="Assinar Plano Premium" />

      <main className="p-6">
        <Card className="max-w-2xl mx-auto border-blue-600 bg-blue-50/50 dark:bg-blue-950 p-6">
          <CardHeader className="flex flex-col items-center gap-2 text-center">
            <Crown className="h-10 w-10 text-yellow-500" />
            <CardTitle className="text-2xl font-bold">Plano Premium</CardTitle>
            <p className="text-muted-foreground text-sm">
              Acesse todos os recursos sem limitações.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold">R$ 49,90</p>
              <p className="text-sm text-muted-foreground">por mês</p>
            </div>

            <ul className="space-y-3">
              {[
                "Criação ilimitada de orçamentos",
                "PDFs personalizados com logo",
                "Acesso antecipado a novidades",
                "Suporte prioritário",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {benefit}
                </li>
              ))}
            </ul>

            <Button className="w-full" size="lg" onClick={handleSubscribe}>
              Assinar agora
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
