import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.category.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { id: _id, userId: _uid, ...data } = await req.json();
  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const existing = await prisma.category.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.isDefault) return NextResponse.json({ error: 'Cannot delete default category' }, { status: 400 });
  // Move prompts to the default category before deleting
  const defaultCat = await prisma.category.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });
  if (defaultCat) {
    await prisma.prompt.updateMany({
      where: { categoryId: id, userId: session.user.id },
      data: { categoryId: defaultCat.id },
    });
  }
  await prisma.category.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
