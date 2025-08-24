"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, LayoutDashboard, Layers, Sparkles, Clock } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AssinarPlanoPage() {
  const { user } = useUser();
  const router = useRouter();

  // --------- Slides ---------
  const slides = ["/mockupVideo1-1.png", "/mockupVideo2-1.png"];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(interval);
  }, []);

  // --------- Cupom e contador ---------
  // Prazo do cupom (BRT). Ajuste se necessário:
  const couponDeadline = useMemo(() => new Date("2025-10-01T23:59:59-03:00"), []);
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const msLeft = Math.max(0, couponDeadline.getTime() - now.getTime());
  const dd = Math.floor(msLeft / (1000 * 60 * 60 * 24));
  const hh = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
  const mm = Math.floor((msLeft / (1000 * 60)) % 60);
  const ss = Math.floor((msLeft / 1000) % 60);
  const couponActive = msLeft > 0;

  const [loading, setLoading] = useState(false);
  const [showCouponHelp, setShowCouponHelp] = useState(false);

  async function handleSubscribe() {
    try {
      setLoading(true);
      // Aqui chamamos seu endpoint que cria a Checkout Session de assinatura (R$49,90/mês)
      // O campo de cupom será exibido no próprio checkout (allow_promotion_codes: true).
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // passe o email do usuário se você não tiver o customerId ainda
          customerEmail: user?.email ?? undefined,
          // não enviamos promotion_code aqui para manter o campo aberto no Checkout
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Falha ao iniciar assinatura.");
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url; // redireciona para a página segura da Stripe
      } else {
        throw new Error("URL do checkout não recebida.");
      }
    } catch (e: any) {
      alert(e?.message ?? "Erro ao iniciar assinatura.");
      setLoading(false);
    }
  }

  return (
    <>
      <SiteHeader title="Assinar Plano Premium" />

      <main className="px-6 md:px-16 py-10 bg-white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Coluna esquerda: texto */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 mb-3 border border-blue-200">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold">EasyOrça Pro</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-blue-600">
              Orçamentos <span className="text-lime-500">ilimitados</span>,
              <br />
              com mais templates e personalizações
            </h1>

            <p className="mt-4 text-gray-700 text-base md:text-lg">
              A versão <strong>Premium</strong> foi feita para acelerar seu fluxo:
              mais controles, mais modelos e liberdade para escalar seu trabalho.
            </p>

            {/* Box de preço */}
            <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-end gap-3">
                <span className="text-4xl md:text-5xl font-extrabold text-blue-700">R$ 49,90</span>
                <span className="text-gray-700 mb-1">/ mês</span>
              </div>

              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3">
                  <FileText className="h-6 w-6 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-800">
                    <strong>Orçamentos ilimitados</strong> e personalizações para
                    acompanhar seu crescimento.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <LayoutDashboard className="h-6 w-6 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-800">
                    <strong>Dashboard</strong> com indicadores do seu negócio.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <Layers className="h-6 w-6 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-800">
                    <strong>+ Templates</strong> para cada tipo de serviço.
                  </p>
                </li>
              </ul>

              {/* Cupom */}
              <div className="mt-5 rounded-xl bg-white border border-blue-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-800">
                    Tem um código promocional?
                    <button
                      className="ml-2 text-blue-700 underline underline-offset-2"
                      onClick={() => setShowCouponHelp((s) => !s)}
                    >
                      Como usar
                    </button>
                  </div>

                  {couponActive ? (
                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>
                        {dd}d {hh}h {mm}m {ss}s para usar:{" "}
                        <strong>ONEORCA29</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Código <strong>ONEORCA29</strong> encerrado
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showCouponHelp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-3 text-sm text-gray-700"
                    >
                      <p className="mb-2">
                        No próximo passo (Checkout seguro da Stripe) haverá um campo
                        “<em>Adicionar código</em>”. Digite <strong>ONEORCA29</strong> para
                        pagar <strong>R$ 29,90 no 1º mês</strong> (depois R$ 49,90/mês).
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          readOnly
                          value="ONEORCA29"
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText("ONEORCA29")}
                        >
                          Copiar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                size="lg"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? "Redirecionando..." : "Assinar Agora"}
              </Button>

              <p className="mt-3 text-xs text-gray-500 text-center">
                Pagamento processado pela Stripe. Você pode cancelar quando quiser
                no Portal do Cliente.
              </p>
            </div>
          </div>

          {/* Coluna direita: carrossel */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-md h-[400px] overflow-hidden rounded-2xl border border-gray-200">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={slides[index]}
                    alt={`Slide ${index + 1}`}
                    width={500}
                    height={400}
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Micro badge “Oferta ativa” quando cupom ainda válido */}
            {couponActive && (
              <div className="absolute -top-3 -right-3 rounded-full bg-lime-500 text-white text-xs font-semibold px-3 py-1 shadow">
                Oferta ativa
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
