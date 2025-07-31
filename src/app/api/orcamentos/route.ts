import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || "dev_fallback_inseguro"; // use variável de servidor

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const orcamentos = await prisma.orcamento.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: "desc" },
      include: {
        cliente: { select: { id: true, nome: true } },
        // itens: { select: { id: true } }, // <- descomente se quiser a contagem
      },
    });

    const response = orcamentos.map((o) => ({
      id: o.id,
      cliente: o.cliente?.nome ?? "—",
      valor: parseFloat(o.valorTotal.toString()),
      data: o.createdAt.toISOString(), // mantenha ISO; o front formata pt-BR
      status: o.status,
      // itensCount: o.itens?.length ?? 0,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 401 });
    }
    console.error("[GET /api/orcamentos] Erro:", err);
    return NextResponse.json({ error: "Erro ao carregar orçamentos" }, { status: 500 });
  }
}
