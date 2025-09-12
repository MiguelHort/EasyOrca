"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  LayoutDashboard, 
  Layers, 
  Sparkles, 
  Clock,
  Crown,
  CheckCircle,
  Shield,
  Zap,
  TrendingUp,
  MessageCircle,
  BarChart3,
  Globe,
  ArrowRight,
  Star,
  Users,
  Target,
  ArrowLeft
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";

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

  async function handleSubscribe() {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: user?.email ?? undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Falha ao iniciar assinatura.");
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL do checkout não recebida.");
      }
    } catch (e: any) {
      alert(e?.message ?? "Erro ao iniciar assinatura.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader title="Assinar OneOrça" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header minimalista */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade para <span className="text-primary">OneOrça</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme seu negócio com ferramentas profissionais de orçamento
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Coluna Principal - Plano */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Timer de Oferta (se ativo) */}
            {couponActive && (
              <div className="bg-primary text-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="h-6 w-6" />
                  <span className="text-lg font-medium">Oferta por tempo limitado</span>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{dd.toString().padStart(2, '0')}</div>
                    <div className="text-sm opacity-90 mt-1">Dias</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{hh.toString().padStart(2, '0')}</div>
                    <div className="text-sm opacity-90 mt-1">Horas</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{mm.toString().padStart(2, '0')}</div>
                    <div className="text-sm opacity-90 mt-1">Min</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold">{ss.toString().padStart(2, '0')}</div>
                    <div className="text-sm opacity-90 mt-1">Seg</div>
                  </div>
                </div>
              </div>
            )}

            {/* Card do Plano */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-blue-700 p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Crown className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">OneOrça Pro</h2>
                    <p className="text-blue-100">Para profissionais que querem mais</p>
                  </div>
                </div>
                
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold">R$ 39</span>
                  <span className="text-xl opacity-90 mb-2">90</span>
                  <span className="text-blue-100 mb-3">/mês</span>
                </div>
              </div>

              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Zap className="h-6 w-6" />,
                      title: "Muito mais Orçamentos",
                      description: "Sem limites para crescer"
                    },
                    {
                      icon: <BarChart3 className="h-6 w-6" />,
                      title: "Analytics Avançado",
                      description: "Insights para otimizar vendas"
                    },
                    {
                      icon: <Layers className="h-6 w-6" />,
                      title: "Templates Exclusivos",
                      description: "Designs profissionais prontos"
                    },
                    {
                      icon: <MessageCircle className="h-6 w-6" />,
                      title: "WhatsApp Envio",
                      description: "Automação inteligente"
                    },
                    {
                      icon: <Users className="h-6 w-6" />,
                      title: "CRM Integrado",
                      description: "Gestão completa de clientes"
                    },
                    {
                      icon: <Shield className="h-6 w-6" />,
                      title: "Backup na Nuvem",
                      description: "Dados sempre protegidos"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-blue-700 text-white font-semibold py-4 rounded-2xl mt-8 text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      Começar agora
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Pagamento seguro • Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Preview e Garantias */}
          <div className="lg:col-span-2 space-y-8">
            {/* Preview do App */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900 text-center">Veja em ação</h3>
              </div>
              
              <div className="relative h-80">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={slides[index]}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-contain p-6"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-6">
                <div className="flex justify-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === index ? "bg-primary w-8" : "bg-gray-200 w-2"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Garantias minimalistas */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">30 dias grátis</h4>
                <p className="text-gray-600 text-sm">Teste sem compromisso</p>
              </div>
              

              <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6 text-center">
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Suporte VIP</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Atendimento prioritário via WhatsApp
                </p>
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Falar conosco
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}