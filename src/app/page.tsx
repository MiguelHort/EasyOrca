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
} from "lucide-react";
import { ThemePButton2 } from "@/components/theme-button-2";
import Link from "next/link";

export default function AutoOrcaLanding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
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
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <NotepadTextDashed className="h-8 w-8 stroke-2 text-primary" />
            <span className="text-xl font-bold text-blue-600">EasyOrça</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Recursos
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Como Funciona
            </a>
            <a
              href="#testimonials"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Depoimentos
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <ThemePButton2 />
            <Link href="/login">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                Entrar
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105">
                Começar Grátis
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto">
          {/* Texto à esquerda */}
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-secondary rounded-full px-4 py-2 mb-6 border border-blue-600/20">
              <Gift className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                50% off - International Girlfriend Day!
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-muted-foreground">
                Don't give a traditional gift.
              </span>
              <br />
              Give something{" "}
              <span className="inline-flex items-center space-x-2">
                <Gift className="w-6 h-6 text-primary" />{" "}
                <span>that makes the</span>
              </span>
              <br />
              <span className="text-primary">heart race.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Turn simple moments into thrilling surprises. Whether it’s a
              birthday, wedding, or just because you remembered — create your
              unique memory now and send it to someone you love.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-base font-semibold hover:bg-primary/90 transition-all">
                Create your memory
              </button>
              <span className="text-sm text-muted-foreground flex items-center">
                💖 45,000+ memories eternalized
              </span>
            </div>
          </div>

          {/* Imagem à direita */}
          <div className="mb-12 md:mb-0 md:ml-12">
            <img
              src="/e15c3cbb-0eeb-4290-bb94-643dfd4ff196.png"
              alt="Love Story Demo"
              className="w-[320px] md:w-[400px] rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Por que escolher o AutoOrça?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Desenvolvido especificamente para profissionais que valorizam
              tempo e qualidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-12 h-12 text-yellow-500" />,
                title: "Velocidade Extrema",
                description:
                  "Crie orçamentos completos em menos de 30 segundos. Sua produtividade nunca mais será a mesma.",
              },
              {
                icon: <Award className="w-12 h-12 text-blue-500" />,
                title: "Qualidade Profissional",
                description:
                  "Templates premium que impressionam clientes e aumentam sua credibilidade no mercado.",
              },
              {
                icon: <Shield className="w-12 h-12 text-green-500" />,
                title: "Segurança Total",
                description:
                  "Criptografia militar e backups automáticos. Seus dados e de seus clientes sempre protegidos.",
              },
              {
                icon: <TrendingUp className="w-12 h-12 text-purple-500" />,
                title: "Aumente suas Vendas",
                description:
                  "Orçamentos profissionais geram 40% mais conversões. Transforme propostas em contratos.",
              },
              {
                icon: <Clock className="w-12 h-12 text-cyan-500" />,
                title: "Economia de Tempo",
                description:
                  "Economize até 20 horas por semana automatizando a criação de orçamentos.",
              },
              {
                icon: <Target className="w-12 h-12 text-red-500" />,
                title: "Foco no Negócio",
                description:
                  "Menos tempo com burocracia, mais tempo para crescer seu negócio e atender clientes.",
              },
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
      <section id="how-it-works" className="py-20 px-4">
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
            <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-blue-600/30 transform -translate-x-1/2 -translate-y-1/2"></div>

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
              <span>Grátis para sempre</span>
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
                <span className="text-xl font-bold text-primary">AutoOrça</span>
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
