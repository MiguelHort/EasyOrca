// components/PremiumProvider.tsx
"use client";

import { createContext, useContext, useMemo, useContext as useReactContext } from "react";
import { useUser } from "@/hooks/useUser";

type PremiumContextType = {
  isPremium: boolean;
  loading: boolean;
};

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  const value = useMemo(
    () => ({
      isPremium: Boolean(user?.isPremium),
      loading: isLoading,
    }),
    [user?.isPremium, isLoading]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const ctx = useReactContext(PremiumContext);
  if (!ctx) {
    throw new Error("usePremium deve ser usado dentro de <PremiumProvider>.");
  }
  return ctx;
}
