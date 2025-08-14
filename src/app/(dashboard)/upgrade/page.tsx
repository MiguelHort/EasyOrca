"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileText, LayoutDashboard, Layers } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function AssinarPlanoPage() {
  const { user } = useUser();
  const router = useRouter();

  // Lista de imagens únicas
  const slides = [
    "/mockupVideo1-1.png",
    "/mockupVideo2-1.png",
  ];

  const [index, setIndex] = useState(0);

  // Troca automática
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000); // troca a cada 4s
    return () => clearInterval(interval);
  }, [slides.length]);

  if (user?.isPremium) {
    router.push("/home");
  }

  const handleSubscribe = async () => {
    alert("Assinatura iniciada!");
  };

  return (
    <>
      <SiteHeader title="Assinar Plano Premium" />

      <main className="px-6 md:px-16 py-10 bg-white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Texto à esquerda */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600">
              Orçamentos <span className="text-lime-400">ilimitados</span>,
              <br />
              com mais templates e personalizações
            </h1>
            <p className="mt-4 text-gray-700 text-base md:text-lg">
              Se você precisa de{" "}
              <strong>mais do que a nossa versão gratuita</strong> oferece, é
              aqui que você irá para o <strong>próximo nível!</strong>
            </p>

            {/* Lista de benefícios */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-8 w-8 text-blue-500 mt-1" />
                <p className="text-sm text-gray-800">
                  <strong>Orçamentos ilimitados</strong> e personalizações para
                  acompanhar o crescimento do seu trabalho.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <LayoutDashboard className="h-8 w-8 text-blue-500 mt-1" />
                <p className="text-sm text-gray-800">
                  <strong>Dashboard</strong> para você visualizar informações do
                  seu negócio que passam batido na correria do dia-a-dia.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="h-8 w-8 text-blue-500 mt-1" />
                <p className="text-sm text-gray-800">
                  <strong>Mais opções de templates</strong> para você escolher
                  qual se enquadra melhor para cada serviço.
                </p>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                size="lg"
                onClick={handleSubscribe}
              >
                Assinar Agora
              </Button>
            </div>
          </div>

          {/* Carrossel de uma imagem por vez */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-md h-[400px] overflow-hidden">
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
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
