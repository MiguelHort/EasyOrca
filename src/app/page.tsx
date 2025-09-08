"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  FileText,
  Users,
  Star,
  Play,
  Zap,
  ChevronRight,
  Smartphone,
  Send,
  CreditCard,
  UserCheck,
  Clock,
  BarChart3,
  Briefcase,
  MessageCircle,
  Globe,
  ArrowRight,
  Shield,
  Target,
  TrendingUp,
  Sparkles,
  Crown,
  Gift,
  X,
  Menu,
} from "lucide-react";
import HeaderLandingPage from "./HeaderLandingPage";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function ModernEasyOrcaLanding() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  setTheme("light");

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Modern Header */}
      <HeaderLandingPage />

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Novo: Integração com IA
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Orçamentos
                  <span className="block bg-primary bg-clip-text text-transparent">
                    profissionais
                  </span>
                  em segundos
                </h1>

                <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  Transforme sua forma de criar orçamentos. Rápido, profissional
                  e direto no WhatsApp do seu cliente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/login"
                  className="group bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center"
                >
                  Começar Grátis Agora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="https://www.instagram.com/easyorca"
                  className="flex items-center justify-center px-8 py-4 border border-gray-300 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demonstração
                </Link>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Grátis para começar
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Sem cartão necessário
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 transform rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-blue-200 rounded animate-pulse delay-100"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse delay-200"></div>
                    <div className="h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        R$ 1.250,00
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-10 bg-blue-600 rounded flex-1 flex items-center justify-center">
                        <Send className="w-5 h-5 text-white" />
                      </div>
                      <div className="h-10 bg-green-500 rounded flex-1 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg animate-bounce">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tudo que você precisa para
              <span className="block text-blue-600">vender mais e melhor</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recursos pensados para profissionais que querem crescer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Criação Instantânea",
                description:
                  "Gere orçamentos profissionais em menos de 30 segundos. Cadastre uma vez, use sempre.",
                color: "from-yellow-400 to-orange-400",
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "Envio Direto WhatsApp",
                description:
                  "Um clique e seu orçamento vai direto para o WhatsApp do cliente. Sem downloads, sem complicação.",
                color: "from-green-400 to-emerald-400",
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Dashboard Inteligente",
                description:
                  "Acompanhe métricas importantes: orçamentos enviados, aceitos, faturamento e muito mais.",
                color: "from-blue-400 to-cyan-400",
              },
              {
                icon: <Briefcase className="w-8 h-8" />,
                title: "Visual Profissional",
                description:
                  "Orçamentos com design moderno que transmitem confiança e profissionalismo.",
                color: "from-purple-400 to-pink-400",
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Acesso em Qualquer Lugar",
                description:
                  "Use no celular, tablet ou computador. Seus dados sempre sincronizados na nuvem.",
                color: "from-indigo-400 to-purple-400",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Segurança Total",
                description:
                  "Seus dados e dos seus clientes protegidos com criptografia de ponta.",
                color: "from-red-400 to-pink-400",
              },
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simples como
              <span className="text-blue-600"> 1, 2, 3</span>
            </h2>
            <p className="text-xl text-gray-600">
              Três passos para revolucionar seus orçamentos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting lines */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-1 animated-arrow"></div>

            {[
              {
                step: "01",
                title: "Cadastre seus Serviços",
                description:
                  "Registre seus produtos e serviços uma única vez com nome, descrição e valores.",
                icon: <FileText className="w-8 h-8" />,
                color: "from-blue-400 to-blue-600",
              },
              {
                step: "02",
                title: "Adicione o Cliente",
                description:
                  "Insira os dados básicos do cliente: nome, telefone e email. Rápido e prático.",
                icon: <Users className="w-8 h-8" />,
                color: "from-purple-400 to-purple-600",
              },
              {
                step: "03",
                title: "Envie e Venda",
                description:
                  "Gere o orçamento profissional e envie direto no WhatsApp. Feche mais negócios!",
                icon: <Target className="w-8 h-8" />,
                color: "from-green-400 to-green-600",
              },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${step.color} text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg relative z-10 transform hover:scale-110 transition-transform`}
                >
                  {step.icon}
                </div>
                <div className="text-6xl font-bold mb-6 text-gray-200">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Escolha o plano ideal
              <span className="block text-blue-600">para seu negócio</span>
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e evolua conforme sua necessidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-gray-700 text-sm font-semibold mb-4">
                  <Gift className="w-4 h-4 mr-2" />
                  Para Começar
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  EasyOrça
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">R$ 0</span>
                  <span className="text-gray-500 ml-2">/mês</span>
                </div>
                <p className="text-gray-600 mt-2">Para sempre grátis</p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Até 10 orçamentos/mês",
                  "2 modelos de orçamento",
                  "Envio por WhatsApp",
                  "Dashboard básico",
                  "Suporte por email",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/login">
                <button className="w-full bg-black text-white py-4 rounded-full font-semibold hover:shadow-lg transform transition-all">
                  Começar Agora
                </button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-8 relative hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold">
                  <Crown className="w-4 h-4 inline mr-2" />
                  Mais Popular
                </div>
              </div>

              <div className="text-center mb-8 mt-4">
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 text-sm font-semibold mb-4">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Para Crescer
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  OneOrça
                </h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold bg-primary bg-clip-text text-transparent">
                    R$ 39
                  </span>
                  <span className="text-gray-500 ml-2">,90/mês</span>
                </div>
                <p className="text-gray-600 mt-2">Faturado mensalmente</p>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  "Orçamentos ilimitados",
                  "Modelos personalizáveis",
                  "WhatsApp + Email automático",
                  "Dashboard completo com métricas",
                  "Gestão de clientes avançada",
                  "Relatórios detalhados",
                  "Suporte prioritário",
                  "Backup automático na nuvem",
                  "IA integrada",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/auth/login">
                <button className="button-pulse w-full bg-primary text-white py-4 rounded-full font-semibold hover:shadow-lg transform transition-all">
                  Começar Teste Grátis
                </button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              Precisa de algo personalizado?
              <a
                href="#"
                className="text-blue-600 font-semibold hover:text-blue-800 ml-1"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="depoimentos"
        className="py-20 bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Quem usa
              <span className="text-blue-600"> recomenda</span>
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 5.000 profissionais já transformaram seus negócios
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 text-yellow-400 fill-current"
                      />
                    )
                  )}
                </div>

                <blockquote className="text-2xl lg:text-3xl text-gray-900 font-medium mb-8 italic leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div className="flex items-center justify-center space-x-4">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-lg">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      {testimonials[currentTestimonial].role}
                    </div>
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
                    index === currentTestimonial
                      ? "bg-blue-600 w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Agora que chegou até aqui,
            <span className="block text-blue-300 mt-2">
              você precisa tomar uma decisão.
            </span>
          </h2>
          <p className="text-gray-300 mb-12 max-w-2xl mx-auto">
            Sabendo que o EasyOrça é totalmente gratuito e vai ser seu braço
            direito na hora de fechar negócios, você ainda vai preferir ficar
            fazendo orçamentos no Word, ou vai investir na sua agilidade no
            dia-a-dia?
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link
              href="/auth/login"
              className="button-pulse group bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center"
            >
              Começar Grátis Agora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-white/80">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>7 dias grátis</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Sem compromisso</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Suporte incluído</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-2xl font-bold text-white">EasyOrça</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                A ferramenta mais rápida e profissional para criar orçamentos.
                Transforme sua forma de vender com tecnologia de ponta.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.tiktok.com/@easyorca"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <span className="text-white text-sm">Tk</span>
                </a>
                <a
                  href="https://www.instagram.com/easyorca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <span className="text-white text-sm">@</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
              {[
                {
                  title: "Institucional",
                  links: [
                    { label: "Termos de Uso", href: "/termos" },
                    {
                      label: "Política de Privacidade",
                      href: "/privacidade",
                    },
                    {
                      label: "Pagamentos & Reembolsos",
                      href: "/pagamentos",
                    },
                    { label: "Contato / Suporte", href: "/suporte" },
                  ],
                },
              ].map((section) => (
                <div key={section.title}>
                  <h4 className="font-semibold text-white mb-6">
                    {section.title}
                  </h4>
                  <ul className="space-y-3 text-gray-400">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 EasyOrça. Todos os direitos reservados.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 text-sm">
                  Feito com ❤️ no Brasil
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400 text-sm">Sistema online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
