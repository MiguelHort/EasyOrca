// components/SWRProvider.tsx
"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url: string) =>
          fetch(url, { credentials: "include" }).then((res) => {
            if (!res.ok) {
              return res.json().then((err) => {
                throw new Error(err?.error || "Erro ao buscar dados");
              });
            }
            return res.json();
          }),
        revalidateOnFocus: true,
        dedupingInterval: 10000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
