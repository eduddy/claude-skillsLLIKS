import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function getOwnedPrompt(id: string, userId: string) {
  return prisma.prompt.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const prompt = await getOwnedPrompt(id, session.user.id);
  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(prompt);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await getOwnedPrompt(id, session.user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { id: _id, userId: _userId, createdAt: _ca, ...data } = body;
  const prompt = await prisma.prompt.update({ where: { id }, data });
  return NextResponse.json(prompt);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await getOwnedPrompt(id, session.user.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.prompt.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
