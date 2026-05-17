import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock database globally
vi.mock('@/lib/db', () => ({
  query: vi.fn(),
  dbPool: {
    query: vi.fn(),
    on: vi.fn(),
    connect: vi.fn().mockResolvedValue({
      query: vi.fn(),
      release: vi.fn(),
    }),
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '',
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'test-user-id' } },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();
