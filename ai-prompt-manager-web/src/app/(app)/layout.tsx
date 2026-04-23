import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppProvider } from '@/context/AppContext';
import { SessionProvider } from 'next-auth/react';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <SessionProvider session={session}>
      <AppProvider>
        {children}
      </AppProvider>
    </SessionProvider>
  );
}
