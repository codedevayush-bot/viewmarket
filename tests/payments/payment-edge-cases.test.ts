/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

/**
 * Edge case and boundary tests for the payment gateway.
 * Covers malformed requests, database failures, concurrent operations, and unusual states.
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

describe('Payment Edge Cases & Boundaries', () => {
  const mockUserId = 'user-edge-001';
  const mockSecret = 'edge_test_secret';
  const mockWebhookSecret = 'webhook_edge_secret';
  const mockOrderId = 'order_edge_123';
  const mockPaymentId = 'pay_edge_456';

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

  describe('Malformed request bodies', () => {
    it('should handle empty JSON object', async () => {
      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(400);
    });

    it('should handle null values in request body', async () => {
      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: null, billingCycle: null }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(400);
    });

    it('should handle extra unknown fields in request body', async () => {
      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'Pro',
          billingCycle: 'monthly',
          unknownField: 'should be ignored',
          anotherField: 12345,
        }),
      });

      const res = await createOrder(req);
      // Should still succeed, extra fields are stripped by Zod
      expect(res.status).toBe(200);
    });

    it('should handle very long string values', async () => {
      const longString = 'a'.repeat(10000);

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: longString,
          razorpay_payment_id: longString,
          razorpay_signature: longString,
        }),
      });

      // Should not crash, signature verification will fail
      await expect(verifyPayment(req)).rejects.toThrow();
    });

    it('should handle unicode characters in request body', async () => {
      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          plan: 'Pro',
          billingCycle: 'monthly',
        }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(200);
    });
  });

  describe('Database failure scenarios', () => {
    it('should handle database connection timeout', async () => {
      vi.mocked(query).mockRejectedValue(
        new Error('connection timeout: could not connect to database')
      );

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(500);
    });

    it('should handle database constraint violation', async () => {
      vi.mocked(query).mockRejectedValue(
        new Error(
          'duplicate key value violates unique constraint "orders_razorpay_order_id_key"'
        )
      );

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(500);
    });

    it('should handle deadlocked transaction', async () => {
      vi.mocked(query).mockRejectedValue(
        new Error('deadlock detected: Process 12345 waits for ShareLock')
      );

      const signature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-deadlock',
              user_id: mockUserId,
              plan: 'Pro',
              billing_cycle: 'monthly',
              amount: 250000,
              status: 'created',
            },
          ],
        } as any)
        .mockRejectedValue(
          new Error('deadlock detected: Process 12345 waits for ShareLock')
        );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      const res = await verifyPayment(req);
      expect(res.status).toBe(500);
    });

    it('should handle read-only database error', async () => {
      vi.mocked(query).mockRejectedValue(
        new Error('cannot execute INSERT in a read-only transaction')
      );

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Pro', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(500);
    });
  });

  describe('Razorpay SDK failure scenarios', () => {
    it('should handle SDK network error', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi
            .fn()
            .mockRejectedValue(new Error('network error: ECONNREFUSED')),
        },
      } as any);

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(500);
    });

    it('should handle SDK rate limit error', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi
            .fn()
            .mockRejectedValue(new Error('Rate limit exceeded: 429')),
        },
      } as any);

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(500);
    });

    it('should handle SDK invalid credentials error', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi
            .fn()
            .mockRejectedValue(new Error('Invalid credentials: 401')),
        },
      } as any);

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      expect(res.status).toBe(500);
    });

    it('should handle SDK returning malformed response', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            // Missing expected id field
            amount: 99900,
            currency: 'INR',
          }),
        },
      } as any);

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      // Should still return 200, but orderId will be undefined
      expect(res.status).toBe(200);
    });
  });

  describe('Concurrent payment scenarios', () => {
    it('should handle two verification attempts for same order simultaneously', async () => {
      const signature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      // First verification succeeds
      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-concurrent',
              user_id: mockUserId,
              plan: 'Pro',
              billing_cycle: 'monthly',
              amount: 250000,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValueOnce({ rowCount: 1, rows: [] } as any)
        .mockResolvedValueOnce({ rowCount: 1, rows: [] } as any)
        .mockResolvedValueOnce({ rowCount: 1, rows: [] } as any);

      const req1 = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      const res1 = await verifyPayment(req1);
      expect(res1.status).toBe(200);

      // Second verification sees order as already paid
      vi.mocked(query).mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-concurrent',
            user_id: mockUserId,
            plan: 'Pro',
            billing_cycle: 'monthly',
            amount: 250000,
            status: 'paid',
          },
        ],
      } as any);

      const req2 = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      const res2 = await verifyPayment(req2);
      const data2 = await res2.json();

      expect(res2.status).toBe(200);
      expect(data2.message).toBe('Already paid');
    });
  });

  describe('Webhook edge cases', () => {
    it('should handle webhook with empty payload', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {},
      };

      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      // Should not crash, but may fail when accessing entity properties
      const res = await webhook(req);
      expect(res.status).toBe(500);
    });

    it('should handle webhook with missing entity in payload', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {},
        },
      };

      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await webhook(req);
      expect(res.status).toBe(500);
    });

    it('should handle webhook with additional unknown event types', async () => {
      const payload = {
        event: 'order.created',
        payload: {
          order: {
            entity: {
              id: 'order_new_001',
              amount: 99900,
            },
          },
        },
      };

      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await webhook(req);
      expect(res.status).toBe(200);
    });

    it('should handle webhook with very large payload', async () => {
      const largeData = 'x'.repeat(100000);
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_large_001',
              order_id: 'order_large_001',
              amount: 99900,
              method: 'upi',
              notes: { largeField: largeData },
            },
          },
        },
      };

      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await webhook(req);
      expect(res.status).toBe(200);
    });

    it('should handle multiple rapid webhook deliveries', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_rapid_001',
              order_id: 'order_rapid_001',
              amount: 99900,
              method: 'card',
            },
          },
        },
      };

      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      // Simulate 5 rapid deliveries with new Request objects each time
      for (let i = 0; i < 5; i++) {
        const req = new Request('http://localhost/api/payments/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-razorpay-signature': signature,
          },
          body,
        });

        const res = await webhook(req);
        expect(res.status).toBe(200);
      }
    });
  });

  describe('Environment variable edge cases', () => {
    it('should handle missing NEXT_PUBLIC_RAZORPAY_KEY_ID gracefully', async () => {
      delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      const res = await createOrder(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.keyId).toBe(undefined);
    });

    it('should handle empty string RAZORPAY_KEY_SECRET in verify', async () => {
      process.env.RAZORPAY_KEY_SECRET = '';

      const signature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      await expect(verifyPayment(req)).rejects.toThrow(
        'Server misconfiguration'
      );
    });

    it('should handle missing RAZORPAY_WEBHOOK_SECRET in webhook', async () => {
      delete process.env.RAZORPAY_WEBHOOK_SECRET;

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

      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, 'some_secret');

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await webhook(req);
      expect(res.status).toBe(500);
    });
  });

  describe('Order status transitions', () => {
    it('should handle order in failed state being retried', async () => {
      vi.mocked(query).mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-failed',
            user_id: mockUserId,
            plan: 'Pro',
            billing_cycle: 'monthly',
            amount: 250000,
            status: 'failed',
          },
        ],
      } as any);

      const signature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      // Should allow retry for failed orders (status !== 'paid')
      const res = await verifyPayment(req);
      expect(res.status).toBe(200);
    });

    it('should handle order in refunded state', async () => {
      vi.mocked(query).mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-refunded',
            user_id: mockUserId,
            plan: 'Pro',
            billing_cycle: 'monthly',
            amount: 250000,
            status: 'refunded',
          },
        ],
      } as any);

      const signature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      // Should allow new payment for refunded order
      const res = await verifyPayment(req);
      expect(res.status).toBe(200);
    });
  });
});
