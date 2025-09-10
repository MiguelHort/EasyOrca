// app/layout.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SWRProvider } from "@/components/SWRprovider";
import { PremiumProvider } from "@/components/PremiumProvider";
import { getUserFromToken } from "@/lib/auth-server";
import Script from "next/script"; // ✅ importa o Script

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasyOrça",
  description: "Gerado por EasyOrça",
  icons: { icon: "/favicon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const user = await getUserFromToken(token);
  const initialIsPremium = Boolean(user?.isPremium);

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SWRProvider>
            <PremiumProvider initialIsPremium={initialIsPremium}>
              {children}

              {/* ✅ Umami (já tinha) */}
              <Script
                defer
                src="https://cloud.umami.is/script.js"
                data-website-id="ea1ffab3-db5a-4917-8e5c-62a30756a93a"
              />

              {/* ✅ Facebook Pixel */}
              <Script id="facebook-pixel" strategy="afterInteractive">
                {`
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '4114808888847827');
                  fbq('track', 'PageView');
                `}
              </Script>

              {/* ✅ Pixel fallback <noscript> */}
              <noscript>
                <img
                  height="1"
                  width="1"
                  style={{ display: "none" }}
                  src="https://www.facebook.com/tr?id=4114808888847827&ev=PageView&noscript=1"
                  alt=""
                />
              </noscript>
            </PremiumProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
