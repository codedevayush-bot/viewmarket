import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => {
    // Each test gets a fresh key to avoid cross-test pollution
  });

  it('allows first request', () => {
    const result = rateLimit(`test-${Date.now()}-1`, {
      limit: 5,
      windowSeconds: 60,
    });
    expect(result).toBeNull();
  });

  it('allows requests within limit', () => {
    const key = `test-${Date.now()}-2`;
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, { limit: 5, windowSeconds: 60 });
      expect(result).toBeNull();
    }
  });

  it('blocks requests over limit', () => {
    const key = `test-${Date.now()}-3`;
    for (let i = 0; i < 5; i++) {
      rateLimit(key, { limit: 5, windowSeconds: 60 });
    }
    const result = rateLimit(key, { limit: 5, windowSeconds: 60 });
    expect(result).not.toBeNull();
  });

  it('has correct rate limit presets', () => {
    expect(RATE_LIMITS.financial.limit).toBe(5);
    expect(RATE_LIMITS.standard.limit).toBe(30);
    expect(RATE_LIMITS.tickets.limit).toBe(10);
    expect(RATE_LIMITS.auth.limit).toBe(10);
  });
});
