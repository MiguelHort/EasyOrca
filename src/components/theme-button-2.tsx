"use client";

import { useUser } from "@/hooks/useUser";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { set } from "zod";

export function ThemePButton2() {
  const { user, isLoading, isError, errorMessage } = useUser();
  const { theme, setTheme } = useTheme();

  if (user?.isPremium == false) {
    setTheme("light");
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`p-2 rounded-full bg-accent hover:bg-accent/80 transition-colors duration-200 cursor-pointer ${user?.isPremium ? '' : 'hidden'}`}
    >
      {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
