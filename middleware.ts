import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const middleware = auth((req) => {
  const { nextUrl } = req;
  const host = req.headers.get('host');

  // 1. WWW Redirection
  if (host === 'www.viewmarket.in') {
    const redirectUrl = new URL(req.url);
    redirectUrl.host = 'viewmarket.in';
    return NextResponse.redirect(redirectUrl, 308);
  }

  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;
  const pathname = nextUrl.pathname;

  // 2. Static Assets & APIs
  const isApiRoute = pathname.startsWith('/api');
  const isNextStatic =
    pathname.startsWith('/_next') || pathname.startsWith('/static');
  const isStaticFile =
    /\.(ico|png|jpg|jpeg|svg|js|css|json|txt|webp|woff|woff2)$/.test(pathname);

  const isPublicPage =
    ['/', '/sign-in', '/auth/error', '/contact', '/pricing', '/cart'].includes(
      pathname
    ) || pathname.startsWith('/legal');

  if (isApiRoute || isNextStatic || isStaticFile) {
    const response = NextResponse.next();
    // Add request ID for distributed tracing
    if (isApiRoute) {
      response.headers.set('X-Request-Id', crypto.randomUUID());
    }
    return response;
  }

  const isAuthRoute = pathname === '/sign-in';
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/user-dashboard');

  // 3. Post-Login Redirection Logic
  if (isLoggedIn) {
    // If admin is landing on root or user-dashboard, force them to /admin
    if (userRole === 'admin') {
      if (pathname === '/' || isDashboardRoute || isAuthRoute) {
        return NextResponse.redirect(new URL('/admin', nextUrl));
      }
    } else {
      // Normal users shouldn't be on /admin or /sign-in
      if (isAdminRoute || isAuthRoute) {
        return NextResponse.redirect(new URL('/user-dashboard', nextUrl));
      }
    }
    return NextResponse.next();
  }

  // 4. Protection Logic for Unauthenticated Users
  if (!isLoggedIn && !isPublicPage) {
    const loginUrl = new URL('/sign-in', nextUrl);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|theme-init.js|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};
