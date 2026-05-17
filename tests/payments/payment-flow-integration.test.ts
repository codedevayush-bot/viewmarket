/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

/**
 * Integration tests for the complete payment flow:
 * 1. Create order -> 2. Verify payment -> 3. Webhook capture
 *
 * These tests simulate the full payment lifecycle without a browser,
 * using mocked database and Razorpay SDK.
 */

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

describe('Payment Flow Integration', () => {
  const mockUserId = 'user-integration-001';
  const mockSecret = 'test_secret_key';
  const mockWebhookSecret = 'webhook_secret';
  const mockRazorpayOrderId = 'order_integration_123';
  const mockPaymentId = 'pay_integration_456';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: mockUserId } } as any);
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key_id';
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = mockWebhookSecret;
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_public';
  });

  describe('Happy path: Create -> Verify -> Webhook', () => {
    it('should complete full payment flow for Starter monthly plan', async () => {
      // Step 1: Create order
      const createReq = new Request(
        'http://localhost/api/payments/create-order',
        {
          method: 'POST',
          body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
        }
      );

      const createRes = await createOrder(createReq);
      const createData = await createRes.json();

      expect(createRes.status).toBe(200);
      expect(createData.orderId).toBe(mockRazorpayOrderId);
      expect(createData.amount).toBe(99900);

      // Step 2: Verify payment
      const signature = generateSignature(
        mockRazorpayOrderId,
        mockPaymentId,
        mockSecret
      );

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-001',
              user_id: mockUserId,
              plan: 'Starter',
              billing_cycle: 'monthly',
              amount: 99900,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const verifyReq = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockRazorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      const verifyRes = await verifyPayment(verifyReq);
      const verifyData = await verifyRes.json();

      expect(verifyRes.status).toBe(200);
      expect(verifyData.success).toBe(true);
      expect(verifyData.plan).toBe('Starter');
    });

    it('should handle webhook payment.captured after verification', async () => {
      // Simulate webhook receiving payment.captured event
      const webhookPayload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: mockPaymentId,
              order_id: mockRazorpayOrderId,
              amount: 250000,
              method: 'card',
            },
          },
        },
      };

      const body = JSON.stringify(webhookPayload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      const webhookReq = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const webhookRes = await webhook(webhookReq);
      expect(webhookRes.status).toBe(200);

      const webhookData = await webhookRes.json();
      expect(webhookData.status).toBe('ok');
    });

    it('should handle refund.processed webhook after successful payment', async () => {
      // First simulate a successful payment
      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ order_id: 'order-db-002' }],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      // Then simulate refund webhook
      const refundPayload = {
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_001',
              payment_id: mockPaymentId,
              amount: 99900,
            },
          },
        },
      };

      const body = JSON.stringify(refundPayload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      const webhookReq = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const webhookRes = await webhook(webhookReq);
      expect(webhookRes.status).toBe(200);

      // Verify order was updated to refunded
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE orders SET status = 'refunded'"),
        ['order-db-002']
      );
    });
  });

  describe('Edge cases in payment flow', () => {
    it('should handle duplicate verification (idempotency)', async () => {
      const signature = generateSignature(
        mockRazorpayOrderId,
        mockPaymentId,
        mockSecret
      );

      // First verification succeeds
      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-003',
              user_id: mockUserId,
              plan: 'Pro',
              billing_cycle: 'yearly',
              amount: 200000,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValueOnce({ rowCount: 1, rows: [] } as any)
        .mockResolvedValueOnce({ rowCount: 1, rows: [] } as any)
        .mockResolvedValueOnce({ rowCount: 1, rows: [] } as any);

      const verifyReq1 = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockRazorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      const res1 = await verifyPayment(verifyReq1);
      expect(res1.status).toBe(200);

      // Second verification should return "Already paid"
      vi.mocked(query).mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-003',
            user_id: mockUserId,
            plan: 'Pro',
            billing_cycle: 'yearly',
            amount: 200000,
            status: 'paid',
          },
        ],
      } as any);

      const verifyReq2 = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockRazorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      const res2 = await verifyPayment(verifyReq2);
      const data2 = await res2.json();

      expect(res2.status).toBe(200);
      expect(data2.success).toBe(true);
      expect(data2.message).toBe('Already paid');
    });

    it('should prevent user from verifying another users order', async () => {
      vi.mocked(query).mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-004',
            user_id: 'different-user-id',
            plan: 'Premium',
            billing_cycle: 'monthly',
            amount: 450000,
            status: 'created',
          },
        ],
      } as any);

      const signature = generateSignature(
        mockRazorpayOrderId,
        mockPaymentId,
        mockSecret
      );

      const verifyReq = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: mockRazorpayOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: signature,
        }),
      });

      const res = await verifyPayment(verifyReq);
      expect(res.status).toBe(403);
    });

    it('should handle webhook with unknown event type gracefully', async () => {
      const unknownPayload = {
        event: 'subscription.renewed',
        payload: { subscription: { entity: { id: 'sub_001' } } },
      };

      const body = JSON.stringify(unknownPayload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      const webhookReq = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await webhook(webhookReq);
      expect(res.status).toBe(200);
    });

    it('should handle payment.failed webhook correctly', async () => {
      const failedPayload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed_001',
              order_id: 'order_failed_001',
              amount: 99900,
              error_code: 'PAYMENT_FAILED',
            },
          },
        },
      };

      const body = JSON.stringify(failedPayload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      const webhookReq = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await webhook(webhookReq);
      expect(res.status).toBe(200);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE orders SET status = 'failed'"),
        ['order_failed_001']
      );
    });
  });

  describe('Cross-plan payment flow', () => {
    it.each([
      { plan: 'Starter', billingCycle: 'monthly', amount: 99900 },
      { plan: 'Starter', billingCycle: 'yearly', amount: 79900 },
      { plan: 'Pro', billingCycle: 'monthly', amount: 250000 },
      { plan: 'Pro', billingCycle: 'yearly', amount: 200000 },
      { plan: 'Premium', billingCycle: 'monthly', amount: 450000 },
      { plan: 'Premium', billingCycle: 'yearly', amount: 360000 },
    ])(
      'should handle $plan $billingCycle plan correctly',
      async ({ plan, billingCycle, amount }) => {
        vi.mocked(getRazorpay).mockReturnValue({
          orders: {
            create: vi.fn().mockResolvedValue({
              id: `order_${plan.toLowerCase()}_${billingCycle}`,
              amount,
              currency: 'INR',
            }),
          },
        } as any);

        const req = new Request('http://localhost/api/payments/create-order', {
          method: 'POST',
          body: JSON.stringify({ plan, billingCycle }),
        });

        const res = await createOrder(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.amount).toBe(amount);
        expect(data.currency).toBe('INR');
      }
    );
  });
});
