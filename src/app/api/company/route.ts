import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client"; // use singleton

const JWT_SECRET = process.env.JWT_SECRET || "testeSIH";
const prisma = new PrismaClient();

function getUserIdFromToken(req: NextRequest): string | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user?.company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: user.company.id },
      data: {
        name: name.trim(),
        image: image?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Erro em PATCH /api/company:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!user?.company) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(user.company);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
