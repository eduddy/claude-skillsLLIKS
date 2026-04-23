import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BUILT_IN_SERVICES = [
  { id: 'svc_claude',   name: 'Claude',   color: '#7C3AED', bgLight: 'bg-indigo-50',  textColor: 'text-indigo-700',  isBuiltIn: true },
  { id: 'svc_gpt4',     name: 'GPT-4',    color: '#10B981', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', isBuiltIn: true },
  { id: 'svc_gemini',   name: 'Gemini',   color: '#0EA5E9', bgLight: 'bg-sky-50',     textColor: 'text-sky-700',     isBuiltIn: true },
  { id: 'svc_mistral',  name: 'Mistral',  color: '#F59E0B', bgLight: 'bg-amber-50',   textColor: 'text-amber-700',   isBuiltIn: true },
  { id: 'svc_custom',   name: 'Custom',   color: '#6B7280', bgLight: 'bg-slate-50',   textColor: 'text-slate-700',   isBuiltIn: true },
];

async function main() {
  console.log('Seeding built-in AI services…');
  for (const svc of BUILT_IN_SERVICES) {
    await prisma.aIService.upsert({
      where: { id: svc.id },
      update: {},
      create: { ...svc, userId: null },
    });
  }
  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
