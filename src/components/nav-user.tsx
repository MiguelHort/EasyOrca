"use client";

import { useEffect, useState } from "react";
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { BriefcaseBusiness } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { mutate } from "swr";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    userName: string;
    nameCompany: string;
  };
}) {
  const { isMobile } = useSidebar();
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  function formatCompanyName(nameCompany: string) {
    return nameCompany.replace(/\s+/g, "").toLowerCase();
  }

    useEffect(() => {
      const fetchUrl = async () => {
        const res = await fetch(`/api/user/profileImage?nome=${user.avatar}`);
        const data = await res.json();
        if (data.url) setImgUrl(`${data.url}&t=${Date.now()}`); // evita cache
      };

      if (user?.avatar) fetchUrl();
    }, [user?.avatar]);

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // garante que o cookie HttpOnly seja enviado
      });

      if (res.ok) {
        // ✅ Limpa o cache de dados do usuário
        await mutate("/api/infoUser", null, { revalidate: false });

        // Redireciona para login
        window.location.href = "/login";
      } else {
        console.error("Erro ao fazer logout");
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={imgUrl || `/api/user/profileImage?file=${user.avatar}`}
                  alt={user.name}
                />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={imgUrl || `/api/user/profileImage?file=${user.avatar}`}
                    alt={user.name}
                  />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={`/${user.userName}/perfilUsuario`}>
                <DropdownMenuItem className="cursor-pointer">
                  <IconUserCircle />
                  Perfil
                </DropdownMenuItem>
              </Link>
              <Link href={`/${user.userName}/perfilEmpresa`}>
                <DropdownMenuItem className="cursor-pointer">
                  <BriefcaseBusiness />
                  Empresa
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-500 hover:bg-red-200 dark:text-red-200 dark:hover:bg-red-900"
            >
              <IconLogout className=" text-red-500 hover:bg-red-200" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
