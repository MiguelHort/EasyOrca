import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || 'testeSIH';

// GET: Lista os clientes da empresa do usuário logado
export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: 'Usuário sem empresa vinculada' }, { status: 403 });
    }

    const clientes = await prisma.cliente.findMany({
      where: { companyId: user.companyId },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(clientes);
  } catch (err) {
    console.error('Erro no GET /clientes:', err);
    return NextResponse.json({ error: 'Token inválido ou erro interno' }, { status: 401 });
  }
}

// POST: Cria um novo cliente na empresa do usuário logado
export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { companyId: true },
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: 'Usuário sem empresa vinculada' }, { status: 403 });
    }

    const body = await req.json();
    const { nome, email, telefone } = body;

    if (!nome || typeof nome !== 'string') {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        companyId: user.companyId,
      },
    });

    return NextResponse.json(novoCliente);
  } catch (err) {
    console.error('Erro no POST /clientes:', err);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
