"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Timer,
  FileText,
  Users,
  ShieldCheck,
  ArrowRight,
  Star,
  Play,
  Zap,
  Target,
  Award,
  TrendingUp,
  Clock,
  Shield,
  Sparkles,
  ChevronRight,
  NotepadTextDashed,
  Gift,
  Smartphone,
  Send,
  CreditCard,
  FilePlus2,
  Wrench,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import HeaderLandingPage from "./HeaderLandingPage";

export default function AutoOrcaLanding() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "João Silva",
      role: "Mecânico Autônomo",
      content:
        "Reduzi o tempo de criação de orçamentos de 15 minutos para 30 segundos. Incrível!",
      rating: 5,
    },
    {
      name: "Maria Santos",
      role: "Proprietária de Oficina",
      content:
        "Meus clientes ficaram impressionados com a qualidade dos orçamentos. Muito profissional!",
      rating: 5,
    },
    {
      name: "Carlos Oliveira",
      role: "Eletricista",
      content:
        "Ferramenta essencial para meu negócio. Não consigo mais trabalhar sem ela!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      <HeaderLandingPage />

      {/* Hero Section */}
      <section className="bg-secondary/50">
        <div className="pt-32 pb-20 bg-blue-600 rounded-b-[80px] sm:rounded-b-[100px] sm:px-6 lg:rounded-b-[120px] text-white overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 flex flex-col-reverse lg:flex-row items-center justify-between gap-8">
            {/* Texto à esquerda */}
            <div className="flex flex-col lg:w-1/2 text-left">
              <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight">
                Faça orçamentos
                <br />
                em menos de
                <br />
                um{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">minuto</span>
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-lime-400 to-transparent rounded-full"></span>
                </span>
              </h1>

              <p
                className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-lg"
                style={{ fontFamily: "Comic Sans Custom" }}
              >
                Uma boa entrega para o seu
                <br />
                cliente, começa aqui.
              </p>

              {/* Imagem da seta curva */}
              <div className="relative mb-6 md:mb-8">
                <img
                  src="/seta.png"
                  alt="Seta curva apontando para o botão"
                  className="absolute -top-10 left-36 sm:left-44 md:left-48 w-16 sm:w-20 md:w-24 h-14 object-contain"
                  draggable={false}
                />
              </div>

              <div className="flex justify-start">
                <Button className="text-sm sm:text-base md:text-lg font-semibold px-6 sm:px-8 py-3 sm:py-4 bg-lime-400 text-white hover:bg-lime-400 transition-all shadow-lg transform hover:scale-105">
                  Conferir planos
                </Button>
              </div>
            </div>

            {/* Mockup à direita */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <Image
                src="/mockup.png"
                alt="Mockup da aplicação EasyOrça"
                width={500}
                height={300}
                className="w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Por que escolher o EasyOrça?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Desenvolvido especificamente para profissionais que valorizam
              tempo e qualidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8 text-yellow-500" />,
                title: "Orçamentos em 30 Segundos",
                description:
                  "Ganhe tempo com a criação de orçamentos automatizados e profissionais em poucos cliques.",
              },
              {
                icon: <Smartphone className="w-8 h-8 text-blue-500" />,
                title: "100% Mobile",
                description:
                  "Use em qualquer celular, tablet ou computador. Ideal para quem está sempre em movimento.",
              },
              {
                icon: <Send className="w-8 h-8 text-green-500" />,
                title: "Envio por WhatsApp",
                description:
                  "Compartilhe orçamentos diretamente com seus clientes pelo WhatsApp ou por link.",
              },
              {
                icon: <FileText className="w-8 h-8 text-purple-500" />,
                title: "PDF Profissional",
                description:
                  "Orçamentos com aparência profissional, prontos para serem enviados e impressionar seus clientes.",
              },
              {
                icon: <CreditCard className="w-8 h-8 text-cyan-500" />,
                title: "Aceita Pix e Cartão",
                description:
                  "Facilite o pagamento com Pix ou cartão via integração com plataformas de pagamento.",
              },
              {
                icon: <UserCheck className="w-8 h-8 text-red-500" />,
                title: "Feito para Autônomos",
                description:
                  "Fácil de usar, sem burocracia. Foco no que realmente importa: vender e atender bem.",
              },
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="h-70 bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Como funciona?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Três passos simples para revolucionar seus orçamentos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting lines */}
            {/* Animated dotted arrow */}
            <div className="hidden md:flex animated-dotted-arrow">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i}>•</span>
              ))}
            </div>

            {[
              {
              step: "01",
              title: "Cadastre-se Grátis",
              description: (
                <>
                Você cadastra seu serviço/produto
                <br />
                <span className="text-sm text-muted-foreground">
                  (Nome, descrição, preço)
                </span>
                </>
              ),
              icon: <Users className="w-8 h-8" />,
              },
              {
              step: "02",
              title: "Configure seus Serviços",
              description: (
                <>
                Coloca os dados do seu cliente
                <br />
                <span className="text-sm text-muted-foreground">
                  (Nome, telefone, email)
                </span>
                </>
              ),
              icon: <FileText className="w-8 h-8" />,
              },
              {
              step: "03",
              title: "Gere Orçamentos",
              description: (
                <>
                Gera o orçamento personalizado com as informações que seu cliente precisa
                <br />
                para você fazer negócio!
                </>
              ),
              icon: <CheckCircle className="w-8 h-8" />,
              },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                {step.icon}
              </div>
              <div className="text-6xl font-bold mb-4 text-primary/20">
                {step.step}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Nós somos suspeitos para dizer
            </h2>
            <p className="text-xl text-muted-foreground">
              Então confira alguns depoimentos de clientes que já usaram e aprovaram nosso sistema!
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map(
                  (_, i) => (
                    <Star
                      key={i}
                      className="w-6 h-6 text-yellow-500 fill-current"
                    />
                  )
                )}
              </div>
              <p className="text-2xl mb-6 italic">
                "{testimonials[currentTestimonial].content}"
              </p>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  <span className="font-bold">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-muted-foreground">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial ? "bg-blue-600" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/80">
            Junte-se a milhares de profissionais que já revolucionaram seus
            orçamentos
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button className="group bg-background text-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-muted transition-all transform hover:scale-105 shadow-xl">
              <span className="flex items-center justify-center space-x-2">
                <span>Começar Grátis Agora</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-primary-foreground/80">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Grátis para nunca </span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">EasyOrça</span>
              </div>
              <p className="text-muted-foreground">
                A ferramenta mais rápida e profissional para criar orçamentos.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Recursos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Preços
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Demonstração
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Sobre
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Termos
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacidade
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 AutoOrça. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
