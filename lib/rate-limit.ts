import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

/**
 * In-memory rate limiter. Returns null if allowed, or a 429 response if exceeded.
 * Key should be a unique identifier (user ID, IP, etc.)
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig
): NextResponse | null {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { error: 'Too many requests', code: 'RATE_LIMITED', retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  return null;
}

/** Preset rate limit configs for common use cases */
export const RATE_LIMITS = {
  /** Financial operations: 5 req/min */
  financial: { limit: 5, windowSeconds: 60 },
  /** Standard API: 30 req/min */
  standard: { limit: 30, windowSeconds: 60 },
  /** Ticket creation: 10 req/min */
  tickets: { limit: 10, windowSeconds: 60 },
  /** Auth/callback: 10 req/min */
  auth: { limit: 10, windowSeconds: 60 },
} as const;
