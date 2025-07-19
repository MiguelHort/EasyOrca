import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || 'test_secret_key';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { id: string };
    const body = await req.json();

    const { clienteId, descricao, valorTotal } = body;

    if (!clienteId || !valorTotal) {
      return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 });
    }

    const orcamento = await prisma.orcamento.create({
      data: {
        userId: payload.id,
        clienteId,
        descricao,
        valorTotal,
      },
    });

    return NextResponse.json(orcamento);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro ao criar orçamento' }, { status: 500 });
  }
}
