import type { NextAuthConfig } from 'next-auth';

// Edge-safe config — no bcrypt, no Prisma imports
// Used by middleware.ts only
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const isAuthPage = pathname === '/login' || pathname === '/register';
      const isApiAuth  = pathname.startsWith('/api/auth');

      if (isApiAuth) return true;
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl.origin));
        return true;
      }
      if (!isLoggedIn) return Response.redirect(new URL('/login', nextUrl.origin));
      return true;
    },
  },
  providers: [], // providers added in auth.ts (Node.js only)
};
