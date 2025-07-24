// src/hooks/useUserInfo.ts
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUserInfo() {
  const [user, setUser] = useState({ companyName: "", companyImage: "" });

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.from("users").select("*").single();
      if (data) setUser(data);
    }
    fetchUser();
  }, []);

  return user;
}
