import { useState, useEffect } from "react";
import { NotepadTextDashed } from "lucide-react";
import Link from "next/link";
import { ThemePButton2 } from "@/components/theme-button-2";
import Image from "next/image";

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
              src="/logo2.png"
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
          <div className="sm:flex items-center space-x-3 lg:space-x-4">
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
  );
}