/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/payments/create-order/route';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import { getRazorpay } from '@/lib/razorpay';

vi.mock('@/auth');
vi.mock('@/lib/db');
vi.mock('@/lib/razorpay');
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
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('API: /api/payments/create-order', () => {
  const mockSession = { user: { id: 'user-abc123' } };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
    vi.mocked(query).mockResolvedValue({ rowCount: 1, rows: [] } as any);
    vi.mocked(getRazorpay).mockReturnValue({
      orders: {
        create: vi.fn().mockResolvedValue({
          id: 'order_test123',
          amount: 99900,
          currency: 'INR',
        }),
      },
    } as any);
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_public';
  });

  it('should return 401 if unauthorized', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Pro', billingCycle: 'monthly' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if plan is invalid', async () => {
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Enterprise', billingCycle: 'monthly' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if billingCycle is invalid', async () => {
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Pro', billingCycle: 'quarterly' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if body is missing required fields', async () => {
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Pro' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: 'not-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should create order successfully for Starter monthly plan', async () => {
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.orderId).toBe('order_test123');
    expect(data.amount).toBe(99900);
    expect(data.currency).toBe('INR');
    expect(data.keyId).toBe('rzp_test_public');
  });

  it('should create order with correct amount for Pro monthly (2500 INR)', async () => {
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Pro', billingCycle: 'monthly' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.amount).toBe(250000);
  });

  it('should create order with correct amount for Premium yearly (3600 INR per month)', async () => {
    vi.mocked(getRazorpay).mockReturnValue({
      orders: {
        create: vi.fn().mockResolvedValue({
          id: 'order_test456',
          amount: 360000,
          currency: 'INR',
        }),
      },
    } as any);

    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Premium', billingCycle: 'yearly' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.amount).toBe(360000);
  });

  it('should insert order into database with correct values', async () => {
    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Pro', billingCycle: 'yearly' }),
    });

    await POST(req);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO orders'),
      expect.arrayContaining([
        'user-abc123',
        'order_test123',
        'Pro',
        'yearly',
        expect.any(Number),
        'INR',
        'created',
        expect.stringContaining('vm_user-ab'),
      ])
    );
  });

  it('should call Razorpay with amount in paise', async () => {
    const createOrderMock = vi.fn().mockResolvedValue({
      id: 'order_test789',
      amount: 200000,
      currency: 'INR',
    });

    vi.mocked(getRazorpay).mockReturnValue({
      orders: { create: createOrderMock },
    } as any);

    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Pro', billingCycle: 'monthly' }),
    });

    await POST(req);

    expect(createOrderMock).toHaveBeenCalledWith({
      amount: 250000,
      currency: 'INR',
      receipt: expect.stringContaining('vm_'),
      notes: {
        userId: 'user-abc123',
        plan: 'Pro',
        billingCycle: 'monthly',
      },
    });
  });

  it('should handle Razorpay API errors gracefully', async () => {
    vi.mocked(getRazorpay).mockReturnValue({
      orders: {
        create: vi.fn().mockRejectedValue(new Error('Razorpay API error')),
      },
    } as any);

    const req = new Request('http://localhost/api/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
    });

    const res = await POST(req);

    expect(res.status).toBe(500);
  });
});
