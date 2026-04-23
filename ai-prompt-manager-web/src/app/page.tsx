import Link from 'next/link';
import { BookMarked, Wand2, Search, Share2, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
  { icon: BookMarked, title: 'Organised Library',    desc: 'Store prompts by AI service, category, and tags. Find anything instantly.' },
  { icon: Wand2,      title: 'Prompt Builder',       desc: 'Compose segment-by-segment with guide patterns from Anthropic, OpenAI & more.' },
  { icon: Search,     title: 'Full-text Search',     desc: 'Search across titles, content, descriptions, and tags in real time.' },
  { icon: Zap,        title: 'Smart Completeness',   desc: 'Category-aware scoring tells you exactly which segments to add next.' },
  { icon: Share2,     title: 'Import / Export',      desc: 'Back up and restore your library as JSON at any time.' },
  { icon: ShieldCheck, title: 'Private by Default',  desc: 'Your prompts are yours — stored in your account, never shared.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <BookMarked className="h-6 w-6 text-indigo-600" />
          <span className="text-lg font-bold text-slate-800 dark:text-white">PromptVault</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            Sign in
          </Link>
          <Link href="/register" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 mb-6 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
          <Zap className="h-3 w-3" /> Multi-user · Postgres-backed · Zero vendor lock-in
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Your prompts,{' '}
          <span className="text-indigo-600">organised</span>
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 mb-10">
          Save, search, and reuse prompts for Claude, GPT-4, Gemini, and any AI service — all in one private, searchable library.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
            Create free account
          </Link>
          <Link href="/login" className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="mb-1 font-semibold text-slate-800 dark:text-white">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-slate-400">
        Built with Next.js · Neon Postgres · Prisma · Auth.js
      </footer>
    </main>
  );
}
