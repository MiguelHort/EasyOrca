import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

const BUCKET = "assets";
const BASE_PATH = "imgs/profileImage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const nome = searchParams.get("nome");

  console.log("Nome do arquivo:", nome);

  if (!nome) {
    return NextResponse.json({ error: "Parâmetro 'nome' é obrigatório." }, { status: 400 });
  }

  const filePath = `${BASE_PATH}/${nome}`;

  const { data, error } = await supabase
    .storage
    .from(BUCKET)
    .createSignedUrl(filePath, 60); // URL válida por 60 segundos

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message || "Erro ao gerar URL." }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "Arquivo (file) e ID do usuário (userId) são obrigatórios." },
        { status: 400 }
      );
    }

    // 2. Buscar o usuário para obter o nome da imagem antiga (se houver)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    const oldImageName = user?.profileImage;

    // 3. Gerar um nome de arquivo único para evitar sobreposições
    const fileExtension = file.name.split(".").pop();
    const newUniqueFileName = `${randomUUID()}.${fileExtension}`;
    const filePath = `${BASE_PATH}/${newUniqueFileName}`;

    // 4. Fazer upload do novo arquivo para o Supabase
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false, // Usar 'false' pois o nome é sempre único
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Erro ao fazer upload para o Supabase:", uploadError.message);
      return NextResponse.json(
        { error: "Erro ao fazer upload do arquivo." },
        { status: 500 }
      );
    }

    // 5. Atualizar o nome da imagem no banco de dados com Prisma ✨
    await prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: newUniqueFileName,
      },
    });

    // 6. (Opcional) Remover a imagem antiga do Supabase Storage 🗑️
    if (oldImageName) {
      const oldImagePath = `${BASE_PATH}/${oldImageName}`;
      await supabase.storage.from(BUCKET).remove([oldImagePath]);
    }

    return NextResponse.json({
      message: "Imagem de perfil atualizada com sucesso.",
      fileName: newUniqueFileName,
    });

  } catch (error) {
    console.error("Erro no processo de upload:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}