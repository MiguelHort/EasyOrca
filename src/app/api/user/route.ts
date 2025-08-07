import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "testeSIH";
const prisma = new PrismaClient();

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded?.id) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const userId = decoded.id;
    const body = await req.json();
    const { name, email, phone, userName, profileImage } = body;

    // Validações simples
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e e-mail são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualiza o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        userName: userName?.trim() || null,
        profileImage: profileImage?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        userName: true,
        phone: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro em PATCH /api/user:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded?.id) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        userName: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      userName: user.userName,
      phone: user.phone,
    });
  } catch (error) {
    console.error("Erro em /api/infoUser:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
