import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.NEXT_PUBLIC_JWT_SECRET || 'test_secret_key';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, secretKey) as { userId: string };

    const orcamentos = await prisma.orcamento.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        cliente: true,
      },
    });

    type OrcamentoWithCliente = typeof orcamentos[number];

    const response = orcamentos.map((orcamento: OrcamentoWithCliente) => ({
      id: orcamento.id,
      cliente: orcamento.cliente.nome,
      valor: parseFloat(orcamento.valorTotal.toString()),
      data: new Date(orcamento.createdAt).toLocaleDateString('pt-BR'),
      status: orcamento.status,
    }));

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}
