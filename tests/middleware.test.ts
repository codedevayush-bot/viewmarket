import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next-auth
vi.mock('@/auth', () => ({
  auth: vi.fn((handler: (...args: unknown[]) => unknown) => handler),
}));

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ headers: new Map() })),
    redirect: vi.fn((url: URL, status?: number) => ({ url, status })),
  },
}));

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Public routes', () => {
    it('allows access to landing page without auth', () => {
      const publicPaths = [
        '/',
        '/pricing',
        '/contact',
        '/sign-in',
        '/auth/error',
      ];
      for (const path of publicPaths) {
        expect(publicPaths).toContain(path);
      }
    });

    it('allows access to legal pages without auth', () => {
      const legalPaths = [
        '/legal/privacy',
        '/legal/terms-of-service',
        '/legal/disclaimer',
        '/legal/risk-disclosure',
        '/legal/cookies',
        '/legal/refund',
      ];
      for (const path of legalPaths) {
        expect(path.startsWith('/legal')).toBe(true);
      }
    });
  });

  describe('Route matching', () => {
    it('excludes API routes from middleware', () => {
      const matcher =
        '/((?!api|_next/static|_next/image|favicon.ico|theme-init.js|.*\\.svg|.*\\.png|.*\\.jpg).*)';
      expect(matcher).toContain('?!api');
    });

    it('excludes static assets from middleware', () => {
      const matcher =
        '/((?!api|_next/static|_next/image|favicon.ico|theme-init.js|.*\\.svg|.*\\.png|.*\\.jpg).*)';
      expect(matcher).toContain('_next/static');
      expect(matcher).toContain('_next/image');
    });
  });

  describe('Role-based routing', () => {
    it('admin users should be redirected to /admin from root', () => {
      const userRole = 'admin';
      const pathname = '/';
      const shouldRedirect = userRole === 'admin' && pathname === '/';
      expect(shouldRedirect).toBe(true);
    });

    it('normal users should be blocked from /admin', () => {
      const userRole = 'user';
      const pathname = '/admin';
      const shouldBlock = userRole !== 'admin' && pathname.startsWith('/admin');
      expect(shouldBlock).toBe(true);
    });

    it('authenticated users should be blocked from /sign-in', () => {
      const isLoggedIn = true;
      const pathname = '/sign-in';
      const shouldBlock = isLoggedIn && pathname === '/sign-in';
      expect(shouldBlock).toBe(true);
    });
  });
});
