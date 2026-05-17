import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Razorpay Singleton', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('RAZORPAY_KEY_ID', 'test_key_id');
    vi.stubEnv('RAZORPAY_KEY_SECRET', 'test_key_secret');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('creates a Razorpay instance with correct credentials', async () => {
    const MockRazorpay = vi.fn(function (this: {
      orders: { create: ReturnType<typeof vi.fn> };
    }) {
      this.orders = { create: vi.fn() };
    });
    vi.doMock('razorpay', () => ({
      default: MockRazorpay,
    }));

    const { getRazorpay } = await import('@/lib/razorpay');
    const Razorpay = (await import('razorpay')).default;

    getRazorpay();

    expect(Razorpay).toHaveBeenCalledWith({
      key_id: 'test_key_id',
      key_secret: 'test_key_secret',
    });
  });

  it('returns the same instance on subsequent calls (singleton)', async () => {
    const MockRazorpay = vi.fn(function (this: {
      orders: { create: ReturnType<typeof vi.fn> };
    }) {
      this.orders = { create: vi.fn() };
    });
    vi.doMock('razorpay', () => ({
      default: MockRazorpay,
    }));

    const { getRazorpay } = await import('@/lib/razorpay');

    const instance1 = getRazorpay();
    const instance2 = getRazorpay();

    expect(instance1).toBe(instance2);
  });

  it('throws if RAZORPAY_KEY_ID is missing', async () => {
    vi.stubEnv('RAZORPAY_KEY_ID', '');

    const { getRazorpay } = await import('@/lib/razorpay');

    expect(() => getRazorpay()).toThrow(
      'Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local'
    );
  });

  it('throws if RAZORPAY_KEY_SECRET is missing', async () => {
    vi.stubEnv('RAZORPAY_KEY_SECRET', '');

    const { getRazorpay } = await import('@/lib/razorpay');

    expect(() => getRazorpay()).toThrow(
      'Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local'
    );
  });

  it('throws if both credentials are missing', async () => {
    vi.stubEnv('RAZORPAY_KEY_ID', '');
    vi.stubEnv('RAZORPAY_KEY_SECRET', '');

    const { getRazorpay } = await import('@/lib/razorpay');

    expect(() => getRazorpay()).toThrow(
      'Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local'
    );
  });
});
