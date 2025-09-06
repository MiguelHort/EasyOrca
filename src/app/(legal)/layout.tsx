// app/(legal)/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/termos", label: "Termos de Uso" },
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/pagamentos", label: "Pagamentos & Reembolsos" },
  { href: "/suporte", label: "Contato / Suporte" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Header fixo */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="max-w-4xl mx-auto flex justify-between items-center px-4 py-3">
          <Link className="text-xl font-bold text-blue-600" href="/">EasyOrça</Link>
          <ul className="flex gap-6 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "hover:text-blue-600 transition-colors",
                    pathname === link.href ? "text-blue-600 font-semibold" : "text-gray-600"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10">{children}</main>

      {/* Rodapé */}
      <footer className="bg-gray-100 text-center py-6 text-sm text-gray-500 border-t">
        © {new Date().getFullYear()} EasyOrça — Todos os direitos reservados
      </footer>
    </div>
  );
}
