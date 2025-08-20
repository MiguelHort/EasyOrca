"use client"

import { FilePlus2 } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { usePremium } from "@/components/PremiumProvider";

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
    style?: string
    iconStyle?: string
  }[]
}) {
  const pathname = usePathname()
  const { isPremium } = usePremium();

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
                    ? `${isPremium ? "bg-[#172658] hover:bg-[#172658]/90" : "bg-primary hover:bg-primary/90"} text-primary-foreground hover:text-primary-foreground dark:text-foreground cursor-pointer`
                    : `${isPremium ? "bg-[#172658] hover:bg-[#172658]/90" : "bg-primary hover:bg-primary/90"} text-primary-foreground hover:text-primary-foreground dark:text-foreground cursor-pointer`
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
              <SidebarMenuItem key={item.title} className="cursor-pointer">
                <Link href={item.url} className="w-full">
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`duration-200 ease-linear cursor-pointer ${
                      isActive
                        ? "bg-border dark:text-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {item.icon && <item.icon className={`${item.iconStyle}`} />}
                    <span className={`${item.style}`}>{item.title}</span>
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
