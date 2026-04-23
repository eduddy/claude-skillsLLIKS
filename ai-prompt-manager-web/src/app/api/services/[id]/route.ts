import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.aIService.findFirst({
    where: { id, userId: session.user.id, isBuiltIn: false },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { id: _id, userId: _uid, isBuiltIn: _b, ...data } = await req.json();
  const service = await prisma.aIService.update({ where: { id }, data });
  return NextResponse.json(service);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.aIService.findFirst({
    where: { id, userId: session.user.id, isBuiltIn: false },
  });
  if (!existing) return NextResponse.json({ error: 'Not found or built-in' }, { status: 404 });
  await prisma.aIService.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
