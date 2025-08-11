"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClipboardList, Users, Crown, CheckCircle, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function ShowPremiumDialog() {
  const [showPremiumDialog, setshowPremiumDialog] = useState(false);
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const promoSeen = localStorage.getItem("showPremiumDialog");

    if (promoSeen !== "false") {
      setshowPremiumDialog(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setToggle((prev) => !prev);
    }, 7000); // 6s de animação + 1s de pausa
    return () => clearTimeout(timer);
  }, [toggle]);

  function handleClosePromo() {
    localStorage.setItem("showPremiumDialog", "false");
    setshowPremiumDialog(false);
  }

  return (
    <Dialog open={showPremiumDialog} onOpenChange={handleClosePromo}>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 ${
          showPremiumDialog ? "" : "hidden"
        }`}
      >
        <div className="rounded-xl p-0 m-4 overflow-hidden bg-background dark:bg-muted shadow-xl max-w-3xl w-full">
          <div className="relative grid grid-cols-1 md:grid-cols-2">
            {/* Lado Esquerdo - Texto */}
            <div className="p-8 flex flex-col justify-between relative">
              <button
                onClick={handleClosePromo}
                className="absolute top-2 right-4 text-white hover:text-zinc-800 dark:hover:text-white text-xl z-10 sm:hidden"
                aria-label="Fechar"
              >
                ×
              </button>
              <div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-zinc-900">
                    Assine o AutoOrça Premium
                  </h2>
                  <p className="text-base text-zinc-600">
                    Eleve seu negócio ao próximo nível. Desbloqueie todos os
                    recursos avançados do AutoOrça com um plano exclusivo.
                  </p>
                </div>

                <div className="mt-6 max-w-100 space-y-4 text-sm md:max-w-80 text-zinc-700">
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-primary mt-0.5" />
                    <span>
                      <strong>Orçamentos ilimitados</strong> com modelos PDF
                      profissionais
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5" />
                    <span>
                      Cadastro e histórico completo de{" "}
                      <strong>clientes e veículos</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-primary mt-0.5" />
                    <span>
                      <strong>Suporte prioritário</strong> e atualizações
                      antecipadas
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                    <span>
                      Acesso a todos os <strong>recursos premium</strong> sem
                      limites
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Link href="/upgrade">
                  <Button className="w-full text-base bg-primary text-white hover:bg-primary/90 transition">
                    Assinar por R$49,90/mês
                  </Button>
                </Link>
                <p className="mt-2 text-xs text-center text-zinc-500 dark:text-zinc-400">
                  Cancele quando quiser. Teste grátis por 7 dias.
                </p>
              </div>
            </div>

            {/* Lado Direito - Imagem e fundo */}
            <div className="relative bg-gradient-to-br from-cyan-600 via-sky-400 to-blue-700 rounded-l-2xl">
              <button
                onClick={handleClosePromo}
                className="absolute top-2 right-4 text-white hover:text-zinc-800 dark:hover:text-white text-xl z-10"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="absolute top-6 left-50 inset-0 translate-x-6 w-190 h-120 hidden md:block">
              <Image
                src="/mockupVideo2.png"
                alt="Imagem 1"
                fill
                className="object-contain"
              />

              <motion.div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${
                    toggle ? "/mockupVideo1.png" : "/mockupVideo2.png"
                  })`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
                initial={{ clipPath: "inset(0% 0% 0% 100%)" }}
                animate={{
                  clipPath: toggle
                    ? "inset(0% 0% 0% 0%)"
                    : "inset(0% 0% 0% 100%)",
                }}
                transition={{ duration: 6, ease: [0.45, 0.05, 0.55, 0.95] }}
              />
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
