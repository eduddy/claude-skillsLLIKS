import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(80),
  color: z.string(),
  bgLight: z.string().default('bg-slate-50'),
  textColor: z.string().default('text-slate-700'),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const services = await prisma.aIService.findMany({
    where: { OR: [{ isBuiltIn: true }, { userId: session.user.id }] },
    orderBy: [{ isBuiltIn: 'desc' }, { name: 'asc' }],
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const service = await prisma.aIService.create({
    data: { ...parsed.data, isBuiltIn: false, userId: session.user.id },
  });
  return NextResponse.json(service, { status: 201 });
}
