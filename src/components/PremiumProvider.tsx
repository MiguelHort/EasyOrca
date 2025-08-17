// components/PremiumProvider.tsx
"use client";
import { createContext, useContext, useMemo, useState, useEffect } from "react";

type Ctx = {
  isPremium: boolean;
  resolved: boolean;              // útil para skeletons
  setIsPremium: (v: boolean) => void;
};

const PremiumCtx = createContext<Ctx | null>(null);

export function PremiumProvider({
  children,
  initialIsPremium = false,
}: {
  children: React.ReactNode;
  initialIsPremium?: boolean;
}) {
  // ✅ já começa correto na 1ª render
  const [isPremium, setIsPremium] = useState<boolean>(initialIsPremium);
  const [resolved, setResolved] = useState<boolean>(true);

  // (Opcional) Revalida em background; não precisa alterar UI se nada mudar
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me", { credentials: "include" });
        if (r.ok) {
          const { isPremium: fresh } = await r.json();
          setIsPremium(Boolean(fresh));
        }
      } finally {
        setResolved(true);
      }
    })();
  }, []);

  const value = useMemo(() => ({ isPremium, resolved, setIsPremium }), [isPremium, resolved]);
  return <PremiumCtx.Provider value={value}>{children}</PremiumCtx.Provider>;
}

export function usePremium() {
  const ctx = useContext(PremiumCtx);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
