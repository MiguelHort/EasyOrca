// /app/api/servicos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || 'testeSIH';

// GET: lista os serviços do usuário autenticado
export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { userId: string };

    const servicos = await prisma.servico.findMany({
      where: { userId: payload.userId },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(servicos);
  } catch (err) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

// POST: adiciona um novo serviço para o usuário
export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const payload = jwt.verify(token, secretKey) as { id?: string };

    if (!payload.id) {
      return NextResponse.json(
        { error: 'Token inválido: sem id' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { nome, preco } = body;

    if (!nome || preco === undefined) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      );
    }

    const novoServico = await prisma.servico.create({
      data: {
        nome,
        preco,
        userId: payload.id,
      },
    });

    return NextResponse.json(novoServico);
  } catch (err: any) {
    console.error(err);

    // Verifica se é erro de serviço duplicado
    if (
      err.code === 'P2002' &&
      err.meta?.target?.includes('nome_userId')
    ) {
      return NextResponse.json(
        { error: 'Já existe um serviço com esse nome' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar serviço' },
      { status: 500 }
    );
  }
}
