import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

// Prisma Singleton para evitar múltiplas conexões no dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const BUCKET = "assets";
const BASE_PATH = "imgs/companyImage";

// =========================
// GET: Gerar URL assinada
// =========================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("nome");

    if (!fileName) {
      return NextResponse.json(
        { error: "Nome do arquivo é obrigatório." },
        { status: 400 }
      );
    }

    const filePath = `${BASE_PATH}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message || "Erro ao gerar URL assinada." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.signedUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno ao gerar URL assinada." },
      { status: 500 }
    );
  }
}

// =========================
// POST: Upload de nova imagem
// =========================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const companyId = formData.get("companyId") as string | null;

    if (!file || !companyId) {
      return NextResponse.json(
        { error: "Arquivo (file) e ID da empresa (companyId) são obrigatórios." },
        { status: 400 }
      );
    }

    // Buscar imagem antiga (se existir)
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { image: true },
    });
    const oldImageName = company?.image;

    // Gerar nome único para a nova imagem
    const ext = file.name.split(".").pop() || "jpg";
    const newFileName = `${randomUUID()}.${ext}`;
    const filePath = `${BASE_PATH}/${newFileName}`;

    // Upload para Supabase
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Erro ao fazer upload do arquivo." },
        { status: 500 }
      );
    }

    // Atualizar no banco
    await prisma.company.update({
      where: { id: companyId },
      data: { image: newFileName },
    });

    // Remover imagem antiga (opcional)
    if (oldImageName) {
      await supabase.storage
        .from(BUCKET)
        .remove([`${BASE_PATH}/${oldImageName}`]);
    }

    return NextResponse.json({
      message: "Imagem da empresa atualizada com sucesso.",
      fileName: newFileName,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
