import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || 'testeSIH';

// GET: Lista os serviços da empresa do usuário logado
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

    const servicos = await prisma.servico.findMany({
      where: { companyId: user.companyId },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json(servicos);
  } catch (err) {
    console.error('Erro no GET /servicos:', err);
    return NextResponse.json({ error: 'Token inválido ou erro interno' }, { status: 401 });
  }
}

// POST: Cria um novo serviço na empresa do usuário logado
export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { companyId: true, isPremium: true, id: true },
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: 'Usuário sem empresa vinculada' }, { status: 403 });
    }

    // Limite por empresa: 30 (normal) ou 100 (premium)
    const limite = user.isPremium ? 100 : 20;
    const totalServicos = await prisma.servico.count({
      where: { companyId: user.companyId },
    });
    if (totalServicos >= limite) {
      return NextResponse.json(
        { error: `Limite de ${limite} serviços atingido para esta empresa.` },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { nome, preco } = body as { nome?: string; preco?: number | string };

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // aceita preco como string "120,00" ou number
    let precoNumber: number;
    if (typeof preco === 'string') {
      precoNumber = Number(preco.replace(',', '.'));
    } else {
      precoNumber = Number(preco);
    }
    if (!Number.isFinite(precoNumber) || precoNumber < 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    }

    const novoServico = await prisma.servico.create({
      data: {
        nome: nome.trim(),
        preco: precoNumber,
        companyId: user.companyId,
      },
    });

    return NextResponse.json(novoServico, { status: 201 });
  } catch (err: any) {
    console.error('Erro no POST /servicos:', err);

    // índice único composto (se existir): nome + companyId
    if (err.code === 'P2002' && err.meta?.target?.includes('nome_companyId')) {
      return NextResponse.json(
        { error: 'Já existe um serviço com esse nome para essa empresa' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}
