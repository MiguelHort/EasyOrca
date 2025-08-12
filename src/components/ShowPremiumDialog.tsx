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
import {
  ClipboardList,
  Users,
  Crown,
  CheckCircle,
  Trophy,
  CircleDollarSign,
  ChartNoAxesCombined,
  LayoutTemplate,
} from "lucide-react";
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
        <div className="rounded-xl p-0 m-4 overflow-hidden bg-background dark:bg-muted shadow-xl max-w-3xl text-primary">
          <div className="relative grid grid-cols-1 md:grid-cols-2">
            {/* Lado Esquerdo - Texto */}
            <div className="p-8 flex flex-col justify-between relative">
              <button
                onClick={handleClosePromo}
                className="absolute top-2 right-4 text-black hover:text-zinc-800 dark:hover:text-white text-xl z-10 sm:hidden"
                aria-label="Fechar"
              >
                ×
              </button>
              <div>
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary leading-snug">
                    A demanda cresceu? <br /> Então esse é o próximo nível!
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg leading-relaxed">
                    O mesmo sistema que você já usa no dia-a-dia, só que{" "}
                    <span className="font-semibold text-primary">
                      mais completo.
                    </span>
                  </p>
                </div>

                <div className="mt-6 max-w-full sm:max-w-[400px] md:max-w-[320px] space-y-4 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <CircleDollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    <span>
                      <strong className="text-primary">
                        Orçamentos ilimitados
                      </strong>{" "}
                      e{" "}
                      <strong className="text-primary">personalizações</strong>{" "}
                      para acompanhar o crescimento do seu trabalho.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <ChartNoAxesCombined className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    <span>
                      <strong className="text-primary">Dashboard</strong> para
                      você visualizar{" "}
                      <strong className="text-primary">
                        informações do seu negócio
                      </strong>{" "}
                      que passam batido na{" "}
                      <strong className="text-primary">
                        correria do dia-a-dia
                      </strong>
                      .
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <LayoutTemplate className="w-6 h-6 sm:w-8 sm:h-8 text-primary mt-0.5" />
                    <span>
                      <strong className="text-primary">
                        Mais opções de templates
                      </strong>{" "}
                      para você escolher qual se enquadra melhor para cada
                      serviço.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Link href="/upgrade">
                  <Button className="w-full text-base bg-primary text-white hover:bg-primary/90 transition">
                    Assinar por R$49,90/mês
                  </Button>
                </Link>
              </div>
            </div>

            {/* Lado Direito - Imagem e fundo */}
            <div className="relative bg-gradient-to-br from-cyan-600 via-sky-400 to-blue-700 rounded-l-2xl">
              <button
                onClick={handleClosePromo}
                className="absolute top-2 right-4 text-white hover:text-zinc-800 text-xl z-10"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="absolute top-6 left-50 inset-0 translate-x-6 w-190 h-120 hidden md:block">
              <Image
                src="/mockupVideo3.png"
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
