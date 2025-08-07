import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET = "seu-bucket"; // substitua pelo nome do seu bucket

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("nome");

  if (!fileName) {
    return NextResponse.json({ error: "Nome do arquivo é obrigatório" }, { status: 400 });
  }

  const { data, error } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrl(fileName, 60); // 60 segundos de validade

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
