// app/layout.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SWRProvider } from "@/components/SWRprovider";
import { PremiumProvider } from "@/components/PremiumProvider"; // mesmo nome de antes
import { getUserFromToken } from "@/lib/auth-server";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasyOrça",
  description: "Gerado por EasyOrça",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ✔ síncrono no server (não use await em cookies())
  const token = cookies().get("token")?.value ?? null;

  // ✔ resolve usuário antes da 1ª pintura
  const user = await getUserFromToken(token);
  const initialIsPremium = Boolean(user?.isPremium);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SWRProvider>
            <PremiumProvider initialIsPremium={initialIsPremium}>
              {children}
            </PremiumProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
