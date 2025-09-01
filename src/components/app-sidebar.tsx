"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ListOrdered,
  Users2,
  Settings2,
  Sparkles,
  Gauge,
} from "lucide-react";

import { useTheme } from "next-themes";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // ⬇️ importe o hook do provider do shadcn/ui
  useSidebar,
} from "@/components/ui/sidebar";

import { useUser } from "@/hooks/useUser";
import { usePremium } from "@/components/PremiumProvider";

import { Logo } from "@/assets/icons/Logo";
import { LogoOneDark, LogoOneLight } from "@/assets/icons/LogoOne";

// --- Fecha automaticamente 8s após abrir ---
function AutoCloseWatcher({ ms = 8_000 }: { ms?: number }) {
  const { open, setOpen /* , isMobile */ } = useSidebar();

  React.useEffect(() => {
    // Se quiser fechar só no mobile, use:
    // if (!open || !isMobile) return;
    if (!open) return;

    const timer = setTimeout(() => {
      setOpen(false);
    }, ms);

    return () => clearTimeout(timer);
  }, [open, setOpen, ms]);

  return null;
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading, isError, errorMessage } = useUser();
  const { isPremium, resolved } = usePremium();
  const { theme } = useTheme();

  const isPremiumEffective = resolved ? isPremium : !!user?.isPremium;

  const userPlaceholder = {
    name: user?.name ?? "",
    email: user?.email ?? "",
    avatar: user?.profileImage ?? undefined,
    userName: user?.userName ?? "",
    nameCompany: user?.company?.name ?? "",
    isPremium: isPremiumEffective,
  };

  const navItems = [
    { title: "Início", url: "/home", icon: LayoutDashboard },
    { title: "Histórico de Orçamentos", url: "/orcamentos", icon: ListOrdered },
    { title: "Clientes", url: "/clientes", icon: Users2 },
    { title: "Serviços", url: "/servicos", icon: Settings2 },
    ...(isPremiumEffective
      ? [{ title: "Dashboard", url: "/dashboard", icon: Gauge } as const]
      : []),
    ...(!isPremiumEffective
      ? [
          {
            title: "Upgrade",
            url: "/upgrade",
            icon: Sparkles,
            iconStyle: "text-primary",
            style: "text-primary font-semibold",
          } as const,
        ]
      : []),
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link className="text-sm font-medium flex items-center gap-2" href="/">
                {isPremiumEffective ? (
                  <>
                    {theme === "dark" ? <LogoOneLight /> : <LogoOneDark />}
                    <span className="text-[#172658] dark:text-white text-xl">
                      OneOrça
                    </span>
                  </>
                ) : (
                  <>
                    <Logo />
                    <span className="text-primary text-xl">EasyOrça</span>
                  </>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userPlaceholder} />
      </SidebarFooter>

      {/* Observador: fecha 10s após abrir */}
      <AutoCloseWatcher ms={10_000} />
    </Sidebar>
  );
}
