import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  description: z.string().optional(),
  aiServiceId: z.string(),
  categoryId: z.string(),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
  variables: z.array(z.object({
    name: z.string(),
    defaultValue: z.string().optional(),
    description: z.string().optional(),
  })).default([]),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const categoryId = searchParams.get('categoryId');
  const serviceId  = searchParams.get('serviceId');
  const favorite   = searchParams.get('favorite');
  const q          = searchParams.get('q');

  const prompts = await prisma.prompt.findMany({
    where: {
      userId: session.user.id,
      ...(categoryId ? { categoryId } : {}),
      ...(serviceId  ? { aiServiceId: serviceId } : {}),
      ...(favorite === 'true' ? { isFavorite: true } : {}),
      ...(q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(prompts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

  const prompt = await prisma.prompt.create({
    data: { ...parsed.data, userId: session.user.id },
  });

  return NextResponse.json(prompt, { status: 201 });
}
