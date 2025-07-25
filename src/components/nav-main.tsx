"use client"

import { FilePlus2 } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ElementType
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Link className="w-full" href="/orcamentos/novo">
              <SidebarMenuButton
                tooltip="Novo Orçamento"
                className={`min-w-8 duration-200 ease-linear ${
                  pathname === "/orcamentos/novo"
                    ? "bg-primary text-foreground hover:text-foreground hover:bg-primary/90 dark:text-foreground dark:hover:bg-primary/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 dark:text-foreground"
                }`}
              >
                <FilePlus2 />
                <span>Novo Orçamento</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url} className="w-full">
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`duration-200 ease-linear ${
                      isActive
                        ? "bg-border dark:text-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
