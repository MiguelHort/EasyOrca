import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  if (typeof window !== "undefined") {
    // navegador => pode mostrar erro
    alert("Supabase env vars faltando");
  } else {
    // ambiente de build => prevenir crash
    console.warn("Supabase env vars faltando no build");
  }
}

// mesmo com vars faltando, ainda exporta o client com valores vazios
export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");