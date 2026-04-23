import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, email: true, name: true },
  });

  // Seed default categories for new user
  await prisma.category.createMany({
    data: [
      { name: 'General',  color: 'bg-slate-500',  isDefault: true,  userId: user.id },
      { name: 'Coding',   color: 'bg-blue-500',   isDefault: false, userId: user.id },
      { name: 'Writing',  color: 'bg-emerald-500',isDefault: false, userId: user.id },
      { name: 'Research', color: 'bg-amber-500',  isDefault: false, userId: user.id },
      { name: 'Creative', color: 'bg-purple-500', isDefault: false, userId: user.id },
    ],
  });

  return NextResponse.json(user, { status: 201 });
}
