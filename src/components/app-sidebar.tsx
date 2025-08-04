"use client"

import * as React from "react"
import {
  LayoutDashboard,
  NotepadTextDashed,
  ListOrdered,
  Users2,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"
import { getInfoUser } from "@/lib/services/infoUser"
import { useEffect, useState } from "react"
import Link from "next/link"

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
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { resolvedTheme } = useTheme()

  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "",
    userName: "",
    nameCompany: "",
  })

  useEffect(() => {
    async function fetchUser() {
      try {
        const userInfo = await getInfoUser()
        setUser({
          name: userInfo?.name || "",
          email: userInfo?.email || "",
          avatar: userInfo?.profileImage || "",
          userName: userInfo?.userName || "",
          nameCompany: userInfo?.company?.name || "",
        })
      } catch (err) {
        console.error("Erro ao carregar usuário:", err)
      }
    }

    fetchUser()
  }, [])

  console.log("User data:", user);

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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
