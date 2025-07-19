import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies(); // ⬅️ aqui
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ user: null });

  try {
    const decoded: any = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
