import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const prompt = await prisma.prompt.findFirst({ where: { id, userId: session.user.id } });
  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.prompt.update({
    where: { id },
    data: { isFavorite: !prompt.isFavorite },
  });
  return NextResponse.json(updated);
}
