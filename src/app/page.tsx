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
import { ThemePButton2 } from "@/components/theme-button-2";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function AutoOrcaLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const stats = [
    { number: "50K+", label: "Orçamentos Criados" },
    { number: "98%", label: "Satisfação dos Usuários" },
    { number: "30s", label: "Tempo Médio de Criação" },
    { number: "24/7", label: "Disponibilidade" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header
        className={`fixed top-0 w-full z-50 backdrop-blur-md transition-colors duration-500 ${
          atTop ? "bg-transparent" : "bg-background/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-16 py-4 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <NotepadTextDashed
              className={`h-8 w-8 stroke-2 ${
                atTop ? "text-white" : "text-primary"
              }`}
            />
            <span
              className={`text-xl font-bold ${
                atTop ? "text-white" : "text-blue-600"
              }`}
            >
              EasyOrça
            </span>
          </div>

          {/* Navegação */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#features"
              className={`transition-colors ${
                atTop
                  ? "text-white hover:text-white/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Nosso Diferencial
            </a>
            <a
              href="#how-it-works"
              className={`transition-colors ${
                atTop
                  ? "text-white hover:text-white/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
                Direto ao Ponto
            </a>
            <a
              href="#testimonials"
              className={`transition-colors ${
                atTop
                  ? "text-white hover:text-white/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Depoimentos
            </a>
          </nav>

          {/* Botões */}
          <div className="flex items-center space-x-4">
            <ThemePButton2 />
            <Link href="/login">
              <button
                className={`transition-colors ${
                  atTop
                    ? "text-white hover:text-white/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Entrar
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-primary-foreground text-foreground font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105">
                Cadastrar-se
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-secondary/50">
        <div className="pt-32 pb-20 px-4 bg-blue-600 rounded-b-[120px] text-white overflow-hidden relative">
          <div className="flex px-16 flex-col-reverse lg:flex-row items-center justify-between max-w-7xl mx-auto">
            {/* Texto à esquerda */}
            <div className="max-w-2xl text-left lg:pr-16">
              <h1 className="text-4xl md:text-3xl lg:text-6xl font-bold mb-8 leading-tight">
                Faça orçamentos
                <br />
                em menos de
                <br />
                <span className="relative inline-block">
                  um{" "}
                  <span className="relative inline-block w-80 text-white font-bold z-10">
                    <img
                      src="\circulo.png"
                      alt="círculo verde"
                      className="absolute top-1 -left-4 w-60 object-containe"
                      style={{ zIndex: 0 }}
                    />
                    <span className="relative z-10 text-white font-bold">
                      minuto
                    </span>
                  </span>
                </span>
              </h1>

              <p
                className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-lg"
                style={{ fontFamily: "Comic Sans MS, cursive" }}
              >
                Uma boa entrega para o seu
                <br />
                cliente, começa aqui.
              </p>

              {/* Imagem da seta curva apontando para o botão */}
              <div className="relative mb-">
                <img
                  src="\seta.png"
                  alt="Seta curva apontando para o botão"
                  className="absolute -top-10 left-48 w-24 h-16 object-contain"
                  draggable={false}
                />
              </div>

              <div className="flex justify-start">
                <Button className="text-lg font-semibold px-8 py-4 bg-lime-400 text-white hover:bg-lime-400 transition-all shadow-lg transform hover:scale-105">
                  Conferir planos
                </Button>
              </div>
            </div>

            {/* Mockups à direita */}
            <div className="mb-12 lg:mb-0 relative flex items-center justify-center lg:justify-end">
              <div className="relative">
                <Image
                  src="/mockup.png"
                  alt="Mockup da aplicação EasyOrça"
                  width={500}
                  height={300}
                />
              </div>
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
                description:
                  "Crie sua conta em menos de 60 segundos. Sem cartão de crédito, sem complicações.",
                icon: <Users className="w-8 h-8" />,
              },
              {
                step: "02",
                title: "Configure seus Serviços",
                description:
                  "Adicione seus serviços, preços e dados da empresa. Tudo fica salvo para reutilização.",
                icon: <FileText className="w-8 h-8" />,
              },
              {
                step: "03",
                title: "Gere Orçamentos",
                description:
                  "Selecione o cliente, escolha os serviços e pronto! Orçamento profissional em segundos.",
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
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Histórias reais de sucesso
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
