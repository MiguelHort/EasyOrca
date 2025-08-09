"use client";

import * as React from "react";
import {
  LayoutDashboard,
  NotepadTextDashed,
  ListOrdered,
  Users2,
  Settings2,
  Sparkles,
} from "lucide-react";

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
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading, isError, errorMessage } = useUser();

  const userPlaceholder = {
    name: user?.name,
    email: user?.email,
    avatar: user?.profileImage,
    userName: user?.userName,
    nameCompany: user?.company?.name,
    isPremium: user?.isPremium || false,
  };

  const navItems = [
    {
      title: "Início",
      url: "/home",
      icon: LayoutDashboard,
    },
    {
      title: "Histórico de Orçamentos",
      url: "/orcamentos",
      icon: ListOrdered,
    },
    {
      title: "Clientes",
      url: "/clientes",
      icon: Users2,
    },
    {
      title: "Serviços",
      url: "/servicos",
      icon: Settings2,
    },
    // Só adiciona o Upgrade se o usuário NÃO for premium
    ...(!userPlaceholder.isPremium
      ? [
          {
            title: "Upgrade",
            url: "/upgrade",
            icon: Sparkles,
            iconStyle: "text-primary",
            style: "text-primary font-semibold",
          },
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
              <Link className="text-sm font-medium" href="/">
                <NotepadTextDashed className="text-blue-600" />
                <span className="text-blue-600 text-xl">EasyOrça</span>
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
    </Sidebar>
  );
}
