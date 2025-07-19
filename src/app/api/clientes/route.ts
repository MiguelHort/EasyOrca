import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || 'testeSIH';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { userId: string };

    const clientes = await prisma.cliente.findMany({
      where: { userId: payload.userId },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(clientes);
  } catch (err) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { id?: string };

    if (!payload.id) {
      console.log(payload);
      return NextResponse.json({ error: 'Token inválido: sem id' }, { status: 401 });
    }

    const body = await req.json();
    const { nome, email, telefone } = body;

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        email,
        telefone,
        userId: payload.id,
      },
    });

    return NextResponse.json(novoCliente);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
