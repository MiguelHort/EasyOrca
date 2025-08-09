import { useState, useEffect } from "react";
import { User } from "lucide-react";
import Link from "next/link";
import { ThemePButton2 } from "@/components/theme-button-2";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HeaderLandingPage() {
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 backdrop-blur-md transition-colors duration-500 ${
        atTop ? "bg-transparent" : "bg-background/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src={atTop ? "/logoHeader.png" : "/logoHeader2.png"}
            alt="Logo"
            width={120}
            height={120}
          />
        </div>

        {/* Navegação */}
        <nav className="hidden md:flex space-x-6 lg:space-x-8">
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
        <div className="flex items-center space-x-3 lg:space-x-4">
          <ThemePButton2 />
          <Link href="/login" className="flex items-center gap-3">
            <button
              className={`transition-colors hidden md:flex cursor-pointer ${
                atTop
                  ? "text-white hover:text-white/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <User className={`w-5 h-5 md:hidden ${atTop ? "stroke-white" : "stroke-foreground"}`} />
          </Link>
          <Link href="/register">
            <Button variant="secondary" className="hover:opacity-90 transition-all transform hover:scale-103">
              Cadastrar-se
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
