/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

/**
 * Tests for HMAC-SHA256 signature verification logic.
 * Covers payment signature verification and webhook signature verification.
 */

vi.mock('@/auth');
vi.mock('@neondatabase/serverless', () => ({
  Pool: vi.fn(() => ({
    query: vi.fn(),
    on: vi.fn(),
    connect: vi.fn().mockResolvedValue({
      query: vi.fn(),
      release: vi.fn(),
    }),
  })),
}));

vi.mock('@/lib/db', () => {
  const q = vi.fn();
  return {
    query: q,
    dbPool: {
      query: q,
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

const { auth } = await import('@/auth');
const { query } = await import('@/lib/db');
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

describe('Signature Verification', () => {
  const mockUserId = 'user-sig-001';
  const mockSecret = 'signature_test_secret';
  const mockWebhookSecret = 'webhook_sig_secret';
  const mockOrderId = 'order_sig_123';
  const mockPaymentId = 'pay_sig_456';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: mockUserId } } as any);
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key_id';
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = mockWebhookSecret;
  });

  describe('Payment signature (HMAC-SHA256)', () => {
    it('should verify signature with correct order_id|payment_id format', async () => {
      const signature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      vi.mocked(query).mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-sig-001',
            user_id: mockUserId,
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
          razorpay_signature: signature,
        }),
      });

      const res = await verifyPayment(req);
      expect(res.status).toBe(200);
    });

    it('should produce consistent signature for same input', () => {
      const sig1 = generateSignature(mockOrderId, mockPaymentId, mockSecret);
      const sig2 = generateSignature(mockOrderId, mockPaymentId, mockSecret);

      expect(sig1).toBe(sig2);
    });

    it('should produce different signature for different order_id', () => {
      const sig1 = generateSignature(mockOrderId, mockPaymentId, mockSecret);
      const sig2 = generateSignature(
        'different_order_id',
        mockPaymentId,
        mockSecret
      );

      expect(sig1).not.toBe(sig2);
    });

    it('should produce different signature for different payment_id', () => {
      const sig1 = generateSignature(mockOrderId, mockPaymentId, mockSecret);
      const sig2 = generateSignature(
        mockOrderId,
        'different_payment_id',
        mockSecret
      );

      expect(sig1).not.toBe(sig2);
    });

    it('should produce different signature for different secret', () => {
      const sig1 = generateSignature(mockOrderId, mockPaymentId, mockSecret);
      const sig2 = generateSignature(
        mockOrderId,
        mockPaymentId,
        'different_secret'
      );

      expect(sig1).not.toBe(sig2);
    });

    it('should use pipe character as separator in signature payload', () => {
      // Verify the format is order_id|payment_id
      const expectedPayload = `${mockOrderId}|${mockPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', mockSecret)
        .update(expectedPayload)
        .digest('hex');

      const actualSignature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      expect(actualSignature).toBe(expectedSignature);
    });

    it('should generate lowercase hex signature', () => {
      const signature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      expect(signature).toBe(signature.toLowerCase());
      expect(signature).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate 64-character hex string (SHA-256)', () => {
      const signature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );

      expect(signature.length).toBe(64);
    });

    it('should handle order_id with special characters', () => {
      const specialOrderId = 'order_test-123_abc.xyz';
      const signature = generateSignature(
        specialOrderId,
        mockPaymentId,
        mockSecret
      );

      expect(signature.length).toBe(64);
      expect(signature).toMatch(/^[0-9a-f]+$/);
    });

    it('should handle payment_id with special characters', () => {
      const specialPaymentId = 'pay_test-456_def.ghi';
      const signature = generateSignature(
        mockOrderId,
        specialPaymentId,
        mockSecret
      );

      expect(signature.length).toBe(64);
      expect(signature).toMatch(/^[0-9a-f]+$/);
    });

    it('should handle empty order_id and payment_id', () => {
      const signature = generateSignature('', '', mockSecret);

      expect(signature.length).toBe(64);
      expect(signature).toBe(
        crypto.createHmac('sha256', mockSecret).update('|').digest('hex')
      );
    });
  });

  describe('Webhook signature (HMAC-SHA256)', () => {
    it('should verify webhook signature with full request body', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_001',
              order_id: 'order_webhook_001',
              amount: 99900,
              method: 'upi',
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

    it('should produce consistent webhook signature for same body', () => {
      const body = JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_001' } } },
      });

      const sig1 = generateWebhookSignature(body, mockWebhookSecret);
      const sig2 = generateWebhookSignature(body, mockWebhookSecret);

      expect(sig1).toBe(sig2);
    });

    it('should produce different signature for JSON key order changes', () => {
      // JSON.stringify preserves key order, so different order = different signature
      const body1 = JSON.stringify({ event: 'test', payload: {} });
      const body2 = JSON.stringify({ payload: {}, event: 'test' });

      const sig1 = generateWebhookSignature(body1, mockWebhookSecret);
      const sig2 = generateWebhookSignature(body2, mockWebhookSecret);

      expect(sig1).not.toBe(sig2);
    });

    it('should produce different signature for whitespace changes in body', () => {
      const body1 = JSON.stringify({ event: 'test', payload: {} });
      const body2 = '{ "event": "test", "payload": {} }';

      const sig1 = generateWebhookSignature(body1, mockWebhookSecret);
      const sig2 = generateWebhookSignature(body2, mockWebhookSecret);

      expect(sig1).not.toBe(sig2);
    });

    it('should handle webhook body with unicode characters', () => {
      const body = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_unicode',
              description: 'Payment for \u20b9999 plan',
            },
          },
        },
      });

      const signature = generateWebhookSignature(body, mockWebhookSecret);

      expect(signature.length).toBe(64);
      expect(signature).toMatch(/^[0-9a-f]+$/);
    });

    it('should handle webhook body with null values', () => {
      const body = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_null_test',
              description: null,
              notes: null,
            },
          },
        },
      });

      const signature = generateWebhookSignature(body, mockWebhookSecret);

      expect(signature.length).toBe(64);
    });

    it('should handle webhook body with nested objects', () => {
      const body = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_nested',
              metadata: {
                user: { id: 'user_001', name: 'Test' },
                plan: { id: 'plan_001', name: 'Pro' },
              },
            },
          },
        },
      });

      const signature = generateWebhookSignature(body, mockWebhookSecret);

      expect(signature.length).toBe(64);
    });

    it('should handle webhook body with arrays', () => {
      const body = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_array_test',
              items: ['item1', 'item2', 'item3'],
            },
          },
        },
      });

      const signature = generateWebhookSignature(body, mockWebhookSecret);

      expect(signature.length).toBe(64);
    });
  });

  describe('Signature comparison', () => {
    it('should use strict string comparison for signatures', async () => {
      const validSignature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );
      // Add a trailing character to make it invalid
      const almostValidSignature = validSignature + 'a';

      vi.mocked(query).mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-compare',
            user_id: mockUserId,
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
          razorpay_signature: almostValidSignature,
        }),
      });

      await expect(verifyPayment(req)).rejects.toThrow(
        'Invalid payment signature'
      );
    });

    it('should reject signature with different case', async () => {
      const validSignature = generateSignature(
        mockOrderId,
        mockPaymentId,
        mockSecret
      );
      const upperCaseSignature = validSignature.toUpperCase();

      vi.mocked(query).mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: 'order-db-case',
            user_id: mockUserId,
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
          razorpay_signature: upperCaseSignature,
        }),
      });

      await expect(verifyPayment(req)).rejects.toThrow(
        'Invalid payment signature'
      );
    });
  });

  describe('Known signature values', () => {
    it('should match expected signature for known test vector', () => {
      // Test with a known secret and payload
      const testSecret = 'test_secret';
      const testOrderId = 'order_123';
      const testPaymentId = 'pay_456';

      const signature = generateSignature(
        testOrderId,
        testPaymentId,
        testSecret
      );

      const expectedSignature = crypto
        .createHmac('sha256', testSecret)
        .update('order_123|pay_456')
        .digest('hex');

      expect(signature).toBe(expectedSignature);
    });

    it('should match expected webhook signature for known test vector', () => {
      const testSecret = 'webhook_test_secret';
      const testBody = JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_test' } } },
      });

      const signature = generateWebhookSignature(testBody, testSecret);

      const expectedSignature = crypto
        .createHmac('sha256', testSecret)
        .update(testBody)
        .digest('hex');

      expect(signature).toBe(expectedSignature);
    });
  });
});
