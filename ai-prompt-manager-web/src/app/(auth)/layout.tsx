import Link from 'next/link';
import { BookMarked } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <BookMarked className="h-7 w-7 text-indigo-600" />
        <span className="text-xl font-bold text-slate-800 dark:text-white">PromptVault</span>
      </Link>
      {children}
    </div>
  );
}
