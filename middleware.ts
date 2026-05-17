import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const publicPaths = [
  '/',
  '/sign-in',
  '/auth/error',
  '/contact',
  '/pricing',
  '/cart',
];

export async function middleware(req: {
  nextUrl: URL;
  headers: Headers;
  url: string;
}) {
  const { nextUrl } = req;
  const host = req.headers.get('host');
  const pathname = nextUrl.pathname;

  // 1. WWW Redirection (always runs, no auth needed)
  if (host === 'www.viewmarket.in') {
    const redirectUrl = new URL(req.url);
    redirectUrl.host = 'viewmarket.in';
    return NextResponse.redirect(redirectUrl, 308);
  }

  const isPublicPage =
    publicPaths.includes(pathname) || pathname.startsWith('/legal');

  // 2. Skip auth entirely for public pages — zero database hit
  if (isPublicPage) {
    return NextResponse.next();
  }

  // 3. Only call auth() for protected routes
  const session = await auth();
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/user-dashboard');
  const isAuthRoute = pathname === '/sign-in';

  // 4. Post-Login Redirection Logic
  if (isLoggedIn) {
    if (userRole === 'admin') {
      if (pathname === '/' || isDashboardRoute || isAuthRoute) {
        return NextResponse.redirect(new URL('/admin', nextUrl));
      }
    } else {
      if (isAdminRoute || isAuthRoute) {
        return NextResponse.redirect(new URL('/user-dashboard', nextUrl));
      }
    }
    return NextResponse.next();
  }

  // 5. Protection Logic for Unauthenticated Users
  if (!isLoggedIn && !isPublicPage) {
    const loginUrl = new URL('/sign-in', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|theme-init.js|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};
