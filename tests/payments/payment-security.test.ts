/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

/**
 * Security tests for the Razorpay payment gateway.
 * Tests for tampering, replay attacks, authorization bypasses, and signature validation.
 */

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

const { auth } = await import('@/auth');
const { query } = await import('@/lib/db');
const { getRazorpay } = await import('@/lib/razorpay');
const { POST: createOrder } =
  await import('@/app/api/payments/create-order/route');
const { POST: verifyPayment } = await import('@/app/api/payments/verify/route');
const { POST: webhook } = await import('@/app/api/payments/webhook/route');

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

function generateWebhookSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

describe('Payment Security', () => {
  const mockUserId = 'user-security-001';
  const mockSecret = 'security_test_secret';
  const mockWebhookSecret = 'webhook_security_secret';
  const mockOrderId = 'order_security_123';
  const mockPaymentId = 'pay_security_456';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: mockUserId },
    } as any);
    vi.mocked(query).mockResolvedValue({ rowCount: 1, rows: [] } as any);
    vi.mocked(getRazorpay).mockReturnValue({
      orders: {
        create: vi.fn().mockResolvedValue({
          id: mockOrderId,
          amount: 99900,
          currency: 'INR',
        }),
      },
    } as any);
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = mockWebhookSecret;
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_public';
  });

  describe('Signature tampering', () => {
    it('should reject modified order_id in verification', async () => {
      const tamperedOrderId = 'order_security_123_tampered';
      const signature = generateSignature(
        tamperedOrderId,
        mockPaymentId,
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: tamperedOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      // Signature will be valid for tampered order, but order won't exist in DB
      vi.mocked(query).mockResolvedValue({ rowCount: 0, rows: [] } as any);

      const res = await verifyPayment(req);
      expect(res.status).toBe(404);
    });

    it('should reject signature generated with wrong secret', async () => {
      const wrongSecret = 'wrong_secret_key';
      const wrongSignature = generateSignature(
        mockOrderId,
        mockPaymentId,
        wrongSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: wrongSignature,
        }),
      });

      await expect(verifyPayment(req)).rejects.toThrow(
        'Invalid payment signature'
      );
    });

    it('should reject signature with swapped order_id and payment_id', async () => {
      // Attacker tries to swap the order
      const swappedSignature = crypto
        .createHmac('sha256', mockSecret)
        .update(`${mockPaymentId}|${mockOrderId}`)
        .digest('hex');

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: swappedSignature,
        }),
      });

      await expect(verifyPayment(req)).rejects.toThrow(
        'Invalid payment signature'
      );
    });

    it('should reject empty signature', async () => {
      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: '',
        }),
      });

      // Empty string fails min(1) validation
      const res = await verifyPayment(req);
      expect(res.status).toBe(400);
    });

    it('should reject signature with extra whitespace', async () => {
      const validSignature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );
      const tamperedSignature = ` ${validSignature} `;

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: tamperedSignature,
        }),
      });

      await expect(verifyPayment(req)).rejects.toThrow(
        'Invalid payment signature'
      );
    });
  });

  describe('Webhook signature security', () => {
    it('should reject webhook with signature from old secret', async () => {
      const oldSecret = 'old_webhook_secret';
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_001',
              order_id: 'order_001',
              amount: 99900,
              method: 'upi',
            },
          },
        },
      };

      const body = JSON.stringify(payload);
      const oldSignature = generateWebhookSignature(body, oldSecret);

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': oldSignature,
        },
        body,
      });

      const res = await webhook(req);
      expect(res.status).toBe(400);
    });

    it('should reject webhook with modified body after signing', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_001',
              order_id: 'order_001',
              amount: 99900,
              method: 'upi',
            },
          },
        },
      };

      const originalBody = JSON.stringify(payload);
      const signature = generateWebhookSignature(
        originalBody,
        mockWebhookSecret
      );

      // Tamper with the amount
      const tamperedPayload = {
        ...payload,
        payload: {
          payment: {
            entity: {
              ...payload.payload.payment.entity,
              amount: 1, // Attacker tries to change amount
            },
          },
        },
      };
      const tamperedBody = JSON.stringify(tamperedPayload);

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body: tamperedBody,
      });

      const res = await webhook(req);
      expect(res.status).toBe(400);
    });

    it('should reject webhook with null signature', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_001',
              order_id: 'order_001',
              amount: 99900,
            },
          },
        },
      };

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': null as any,
        },
        body: JSON.stringify(payload),
      });

      const res = await webhook(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Authorization bypass attempts', () => {
    it('should reject create-order without authentication', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Pro', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(401);
    });

    it('should reject verify without authentication', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'any_signature',
        }),
      });

      const res = await verifyPayment(req);
      expect(res.status).toBe(401);
    });

    it('should reject verify with session user id missing', async () => {
      vi.mocked(auth).mockResolvedValue({ user: {} } as any);

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'any_signature',
        }),
      });

      const res = await verifyPayment(req);
      expect(res.status).toBe(401);
    });

    it('should prevent SQL injection in plan parameter', async () => {
      const maliciousPlan = "Pro'; DROP TABLE orders; --";

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          plan: maliciousPlan,
          billingCycle: 'monthly',
        }),
      });

      const res = await createOrder(req);
      // Zod validation should reject this
      expect(res.status).toBe(400);
    });

    it('should prevent SQL injection in billingCycle parameter', async () => {
      const maliciousCycle = "monthly'; DROP TABLE users; --";

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'Pro',
          billingCycle: maliciousCycle,
        }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Amount tampering', () => {
    it('should use server-side pricing not client-provided amount', async () => {
      // Even if client tries to manipulate, server calculates from planPrices
      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Premium', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      const data = await res.json();

      // Should be 450000 paise (4500 INR), not any manipulated value
      expect(data.amount).toBe(450000);
    });

    it('should reject negative or zero amounts via invalid plan', async () => {
      // No way to pass custom amount, but verify invalid plans are rejected
      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Free', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(400);
    });
  });

  describe('Replay attack prevention', () => {
    it('should handle duplicate webhook events idempotently', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_replay_001',
              order_id: 'order_replay_001',
              amount: 99900,
              method: 'upi',
            },
          },
        },
      };

      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      // First delivery
      const req1 = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res1 = await webhook(req1);
      expect(res1.status).toBe(200);

      // Replay delivery (same event, new Request object)
      const req2 = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res2 = await webhook(req2);
      expect(res2.status).toBe(200);

      // ON CONFLICT DO NOTHING should prevent duplicate payments
      expect(query).toHaveBeenCalledTimes(4); // 2 updates + 2 inserts
    });
  });

  describe('Credential exposure prevention', () => {
    it('should not expose secret key in create-order response', async () => {
      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      const data = await res.json();

      expect(data).not.toHaveProperty('keySecret');
      expect(data).not.toHaveProperty('secret');
      expect(data).toHaveProperty('keyId', 'rzp_test_public');
    });

    it('should not expose webhook secret in error messages', async () => {
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'invalid',
        },
        body: JSON.stringify({ event: 'test', payload: {} }),
      });

      const res = await webhook(req);
      const data = await res.json();

      expect(data.error).not.toContain(mockWebhookSecret);
      expect(data.error).not.toContain('secret');
    });
  });
});
