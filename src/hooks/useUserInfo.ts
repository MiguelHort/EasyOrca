// src/hooks/useUserInfo.ts
"use client";

import { useEffect, useState } from "react";

export function useUserInfo() {
  const [user, setUser] = useState<null | {
    id: string;
    name: string;
    email: string;
    companyName: string;
    companyImage: string;
  }>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      setUser(json.user);
    }

    fetchUser();
  }, []);

  return user;
}
