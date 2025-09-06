// app/layout.tsx ou app/home/layout.tsx
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { PremiumProvider } from "@/components/PremiumProvider";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

type JwtPayload = { isPremium?: boolean } | null;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // cookies() agora é await
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let initialIsPremium = false;
  if (token) {
    try {
      const payload = jwt.decode(token) as JwtPayload;
      initialIsPremium = !!payload?.isPremium;
    } catch {
      // ignora erro
    }
  }

  return (
    <PremiumProvider initialIsPremium={initialIsPremium}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>{children}</SidebarInset>
        <Toaster />
      </SidebarProvider>
    </PremiumProvider>
  );
}
