import { useState, useEffect } from "react";
import { User, Menu, X } from "lucide-react";
import Link from "next/link";
import { ThemePButton2 } from "@/components/theme-button-2";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HeaderLandingPage() {
  const [atTop, setAtTop] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setAtTop(window.scrollY === 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { href: "#recursos", label: "Recursos" },
    { href: "#como-funciona", label: "Como Funciona" },
    { href: "#planos", label: "Planos" },
    { href: "#depoimentos", label: "Depoimentos" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        atTop
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Image
              src="/logoHeader2.png"
              alt="EasyOrça Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-medium transition-colors duration-200 hover:scale-105 transform text-gray-600 hover:text-gray-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemePButton2 />

            <Link href="/login">
              <button className="font-medium transition-colors duration-200 text-gray-600 hover:text-gray-900">
                Entrar
              </button>
            </Link>

            <Link href="/register">
              <Button className="font-semibold px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105 bg-primary text-white hover:shadow-lg">
                Começar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemePButton2 />
            <Link href="/login" className="flex items-center">
              <User
                className={`w-6 h-6 ${atTop ? "text-white" : "text-gray-600"}`}
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 transition-colors ${
                atTop ? "text-white" : "text-gray-600"
              }`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden border-t transition-all duration-300 ${
              atTop ? "border-white/20" : "border-gray-100"
            }`}
          >
            <div
              className={`px-4 py-6 space-y-6 ${
                atTop ? "bg-blue-600/95 backdrop-blur-lg" : "bg-white"
              }`}
            >
              {/* Navigation Links */}
              <nav className="space-y-4">
                {menuItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block text-lg font-medium transition-colors ${
                      atTop
                        ? "text-white hover:text-white/80"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="flex flex-col space-y-4 pt-6 border-t border-white/20">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <button
                    className={`w-full text-left text-lg font-medium transition-colors ${
                      atTop
                        ? "text-white hover:text-white/80"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Entrar
                  </button>
                </Link>

                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    className={`w-full font-semibold py-3 rounded-full transition-all ${
                      atTop
                        ? "bg-white text-blue-600 hover:bg-gray-100"
                        : "bg-primary text-white hover:shadow-lg"
                    }`}
                  >
                    Começar Grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
