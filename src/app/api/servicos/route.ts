// /app/api/servicos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || 'testeSIH';

// Função auxiliar para obter a companyId do usuário autenticado
async function getCompanyIdFromToken(token: string): Promise<string | null> {
  try {
    const payload = jwt.verify(token, secretKey) as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { companyId: true },
    });
    return user?.companyId ?? null;
  } catch {
    return null;
  }
}

// GET: lista os serviços da empresa do usuário autenticado
export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const companyId = await getCompanyIdFromToken(token);
  if (!companyId)
    return NextResponse.json({ error: 'Usuário sem empresa associada' }, { status: 403 });

  try {
    const servicos = await prisma.servico.findMany({
      where: { companyId },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(servicos);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

// POST: adiciona um novo serviço para a empresa do usuário
export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token)
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const companyId = await getCompanyIdFromToken(token);
  if (!companyId)
    return NextResponse.json({ error: 'Usuário sem empresa associada' }, { status: 403 });

  try {
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
        companyId,
      },
    });

    return NextResponse.json(novoServico);
  } catch (err: any) {
    console.error(err);

    if (
      err.code === 'P2002' &&
      err.meta?.target?.includes('nome_companyId')
    ) {
      return NextResponse.json(
        { error: 'Já existe um serviço com esse nome para essa empresa' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar serviço' },
      { status: 500 }
    );
  }
}
