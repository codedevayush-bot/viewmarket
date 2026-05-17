/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/payments/verify/route';
import { auth } from '@/auth';
import { query } from '@/lib/db';
import crypto from 'crypto';

vi.mock('@/auth');
vi.mock('@/lib/db', () => {
  const q = vi.fn();
  return {
    query: q,
    dbPool: {
      connect: vi.fn().mockResolvedValue({
        query: q,
        release: vi.fn(),
      }),
      on: vi.fn(),
    },
  };
});
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

function generateSignature(
  orderId: string,
  paymentId: string,
  secret: string
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

describe('API: /api/payments/verify', () => {
  const mockSession = { user: { id: 'user-abc123' } };
  const mockOrderId = 'order_test123';
  const mockPaymentId = 'pay_test456';
  const mockSecret = 'test_key_secret';
  const mockSignature = generateSignature(
    mockOrderId,
    mockPaymentId,
    mockSecret
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(mockSession as any);
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key_id';
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
  });

  it('should return 401 if unauthorized', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if required fields are missing', async () => {
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: 'not-json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if signature verification fails', async () => {
    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'invalid_signature',
      }),
    });

    await expect(POST(req)).rejects.toThrow('Invalid payment signature');
  });

  it('should return 500 if RAZORPAY_KEY_SECRET is not set', async () => {
    delete process.env.RAZORPAY_KEY_SECRET;

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    await expect(POST(req)).rejects.toThrow('Server misconfiguration');
  });

  it('should return 404 if order not found in database', async () => {
    vi.mocked(query).mockResolvedValue({ rowCount: 0, rows: [] } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('should return 403 if order does not belong to user', async () => {
    vi.mocked(query).mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 'order-db-id',
          user_id: 'different-user',
          plan: 'Pro',
          billing_cycle: 'monthly',
          amount: 250000,
          status: 'created',
        },
      ],
    } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('should return success if order is already paid', async () => {
    vi.mocked(query).mockResolvedValue({
      rowCount: 1,
      rows: [
        {
          id: 'order-db-id',
          user_id: 'user-abc123',
          plan: 'Pro',
          billing_cycle: 'monthly',
          amount: 250000,
          status: 'paid',
        },
      ],
    } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Already paid');
  });

  it('should verify signature correctly with valid HMAC-SHA256', async () => {
    vi.mocked(query)
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-id',
            user_id: 'user-abc123',
            plan: 'Pro',
            billing_cycle: 'monthly',
            amount: 250000,
            status: 'created',
          },
        ],
      } as any)
      .mockResolvedValue({ rowCount: 1, rows: [] } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    const res = await POST(req);
    if (res.status !== 200) {
      console.log(await res.json());
    }
    expect(res.status).toBe(200);
  });

  it('should update order status to paid on successful verification', async () => {
    vi.mocked(query)
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-id',
            user_id: 'user-abc123',
            plan: 'Pro',
            billing_cycle: 'monthly',
            amount: 250000,
            status: 'created',
          },
        ],
      } as any)
      .mockResolvedValue({ rowCount: 1, rows: [] } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    await POST(req);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE orders SET status = 'paid'"),
      ['order-db-id']
    );
  });

  it('should insert payment record on successful verification', async () => {
    vi.mocked(query)
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-id',
            user_id: 'user-abc123',
            plan: 'Pro',
            billing_cycle: 'monthly',
            amount: 250000,
            status: 'created',
          },
        ],
      } as any)
      .mockResolvedValue({ rowCount: 1, rows: [] } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    await POST(req);

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO payments'),
      [
        'order-db-id',
        'user-abc123',
        mockPaymentId,
        mockSignature,
        250000,
        'captured',
      ]
    );
  });

  it('should upsert user subscription with correct dates for monthly plan', async () => {
    vi.mocked(query)
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-id',
            user_id: 'user-abc123',
            plan: 'Pro',
            billing_cycle: 'monthly',
            amount: 250000,
            status: 'created',
          },
        ],
      } as any)
      .mockResolvedValue({ rowCount: 1, rows: [] } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    await POST(req);

    const subscriptionCall = vi
      .mocked(query)
      .mock.calls.find(
        (call) =>
          typeof call[0] === 'string' && call[0].includes('user_subscriptions')
      );

    expect(subscriptionCall).toBeDefined();
    const params = subscriptionCall![1] as any[];
    expect(params[0]).toBe('user-abc123');
    expect(params[1]).toBe('Pro');
    expect(params[2]).toBe('monthly');
    expect(params[5]).toBe(mockOrderId);
  });

  it('should upsert user subscription with yearly end date for yearly plan', async () => {
    vi.mocked(query)
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-id',
            user_id: 'user-abc123',
            plan: 'Premium',
            billing_cycle: 'yearly',
            amount: 4320000,
            status: 'created',
          },
        ],
      } as any)
      .mockResolvedValue({ rowCount: 1, rows: [] } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    await POST(req);

    const subscriptionCall = vi
      .mocked(query)
      .mock.calls.find(
        (call) =>
          typeof call[0] === 'string' && call[0].includes('user_subscriptions')
      );

    expect(subscriptionCall).toBeDefined();
    const params = subscriptionCall![1] as any[];
    expect(params[2]).toBe('yearly');

    const startDate = new Date(params[3]);
    const endDate = new Date(params[4]);
    const diffMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());
    expect(diffMonths).toBe(12);
  });

  it('should return success with plan and billingCycle on completion', async () => {
    vi.mocked(query)
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-id',
            user_id: 'user-abc123',
            plan: 'Starter',
            billing_cycle: 'monthly',
            amount: 99900,
            status: 'created',
          },
        ],
      } as any)
      .mockResolvedValue({ rowCount: 1, rows: [] } as any);

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.plan).toBe('Starter');
    expect(data.billingCycle).toBe('monthly');
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(query)
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-id',
            user_id: 'user-abc123',
            plan: 'Pro',
            billing_cycle: 'monthly',
            amount: 250000,
            status: 'created',
          },
        ],
      } as any)
      .mockRejectedValue(new Error('Database connection error'));

    const req = new Request('http://localhost/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: mockOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
