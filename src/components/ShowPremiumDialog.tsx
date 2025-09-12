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

              {/* SEÇÃO DE TEXTO */}
              <div className="space-y-2">
                {/* Título com animação de sublinhado mais sutil e impactante */}
                <h2 className="text-balance text-lg sm:text-xl lg:text-2xl font-extrabold leading-tight tracking-tight">
                  <span className="relative inline-block bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    A demanda cresceu?
                  </span>{" "}
                  <br className="hidden sm:block" />
                  Então esse é o próximo nível!
                </h2>

                {/* Parágrafo com melhorias de legibilidade e responsividade */}
                <p className="text-pretty text-xs sm:text-xs text-muted-foreground max-w-prose">
                  O mesmo sistema que você já usa no dia-a-dia, só que{" "}
                  <span className="font-semibold text-foreground underline decoration-primary/40 underline-offset-4">
                    mais completo
                  </span>
                  .
                </p>
              </div>

              {/* SEÇÃO DE CARDS */}
              <div className="mt-6 max-w-md space-y-3">
                {/* CARD 1 - Estilo unificado */}
                <div className="group relative flex items-start gap-4 rounded-lg border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                  {/* Efeito de halo mantido, mas aplicado ao novo design do card */}
                  <span className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top_left,theme(colors.primary/10),transparent_60%)]" />

                  <span className="grid size-10 flex-shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <CircleDollarSign className="size-5" aria-hidden="true" />
                  </span>

                  <div className="text-xs text-muted-foreground">
                    <strong className="font-semibold text-foreground">
                      Muito mais Orçamentos
                    </strong>{" "}
                    e{" "}
                    <strong className="font-semibold text-foreground">
                      personalizações
                    </strong>{" "}
                    para acompanhar o crescimento do seu trabalho.
                  </div>
                </div>

                {/* CARD 2 - Estilo unificado */}
                <div className="group relative flex items-start gap-4 rounded-lg border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                  <span className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top_right,theme(colors.primary/10),transparent_60%)]" />

                  <span className="grid size-10 flex-shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <ChartNoAxesCombined
                      className="size-5"
                      aria-hidden="true"
                    />
                  </span>

                  <div className="text-xs text-muted-foreground">
                    <strong className="font-semibold text-foreground">
                      Dashboard
                    </strong>{" "}
                    para você visualizar{" "}
                    <strong className="font-semibold text-foreground">
                      informações do seu negócio
                    </strong>{" "}
                    que passam batido na correria do dia-a-dia.
                  </div>
                </div>

                {/* CARD 3 - Estilo unificado */}
                <div className="group relative flex items-start gap-4 rounded-lg border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/40">
                  <span className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_bottom_left,theme(colors.primary/10),transparent_60%)]" />

                  <span className="grid size-10 flex-shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <LayoutTemplate className="size-5" aria-hidden="true" />
                  </span>

                  <div className="text-xs text-muted-foreground">
                    <strong className="font-semibold text-foreground">
                      Mais opções de templates
                    </strong>{" "}
                    para escolher o que se encaixa melhor em cada serviço.
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Link href="/upgrade">
                  <Button
                    className="button-pulse w-full text-base sm:text-sm shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label="Assinar plano por R$39,90 por mês"
                  >
                    Assinar por R$39,90/mês
                  </Button>
                </Link>
              </div>
            </div>

            {/* Lado Direito - Imagem e fundo */}
            <div className="relative bg-gradient-to-br from-blue-800 via-sky-600 to-blue-800 rounded-l-2xl">
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
