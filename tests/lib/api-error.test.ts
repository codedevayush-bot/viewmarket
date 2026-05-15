import { describe, it, expect, vi } from 'vitest';
import { ApiError } from '@/lib/api-error';

// Mock pino
vi.mock('@/lib/logger', () => ({
  default: {
    child: () => ({
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ApiError', () => {
  it('creates error with correct properties', () => {
    const error = new ApiError('Not found', 'NOT_FOUND', 404);
    expect(error.message).toBe('Not found');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.name).toBe('ApiError');
  });

  it('is an instance of Error', () => {
    const error = new ApiError('Test', 'TEST', 500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});
