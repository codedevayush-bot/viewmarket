/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/payments/webhook/route';
import { query } from '@/lib/db';
import crypto from 'crypto';

vi.mock('@/lib/db');
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

function generateWebhookSignature(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

describe('API: /api/payments/webhook', () => {
  const mockWebhookSecret = 'webhook_secret_test';

  beforeEach(() => {
    vi.resetAllMocks();
    process.env.RAZORPAY_WEBHOOK_SECRET = mockWebhookSecret;
    vi.mocked(query).mockResolvedValue({ rowCount: 1, rows: [] } as any);
  });

  it('should return 400 if signature header is missing', async () => {
    const body = JSON.stringify({ event: 'payment.captured', payload: {} });
    const req = new Request('http://localhost/api/payments/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Missing signature');
  });

  it('should return 500 if RAZORPAY_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET;

    const body = JSON.stringify({ event: 'payment.captured', payload: {} });
    const signature = generateWebhookSignature(body, 'some_secret');
    const req = new Request('http://localhost/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('should return 400 if signature verification fails', async () => {
    const body = JSON.stringify({ event: 'payment.captured', payload: {} });
    const req = new Request('http://localhost/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'invalid_signature',
      },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Invalid signature');
  });

  it('should return 400 if body is not valid JSON', async () => {
    const body = 'not-json';
    const signature = generateWebhookSignature(body, mockWebhookSecret);
    const req = new Request('http://localhost/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature,
      },
      body,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  describe('payment.captured event', () => {
    function createPaymentCapturedWebhook() {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test123',
              order_id: 'order_test456',
              amount: 99900,
              method: 'upi',
            },
          },
        },
      };
      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);
      return { body, signature };
    }

    it('should update order status to paid', async () => {
      const { body, signature } = createPaymentCapturedWebhook();
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      await POST(req);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining(
          "UPDATE orders SET status = 'paid' WHERE razorpay_order_id"
        ),
        ['order_test456']
      );
    });

    it('should insert payment record', async () => {
      const { body, signature } = createPaymentCapturedWebhook();
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      await POST(req);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO payments'),
        ['order_test456', 'pay_test123', 99900, 'upi']
      );
    });

    it('should return 200 with status ok', async () => {
      const { body, signature } = createPaymentCapturedWebhook();
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('ok');
    });
  });

  describe('payment.failed event', () => {
    function createPaymentFailedWebhook() {
      const payload = {
        event: 'payment.failed',
        payload: {
          payment: {
            entity: {
              id: 'pay_failed123',
              order_id: 'order_failed456',
              amount: 250000,
            },
          },
        },
      };
      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);
      return { body, signature };
    }

    it('should update order status to failed', async () => {
      const { body, signature } = createPaymentFailedWebhook();
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      await POST(req);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining(
          "UPDATE orders SET status = 'failed' WHERE razorpay_order_id"
        ),
        ['order_failed456']
      );
    });

    it('should return 200 with status ok', async () => {
      const { body, signature } = createPaymentFailedWebhook();
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe('refund.processed event', () => {
    function createRefundProcessedWebhook() {
      const payload = {
        event: 'refund.processed',
        payload: {
          refund: {
            entity: {
              id: 'rfnd_test123',
              payment_id: 'pay_test456',
              amount: 99900,
            },
          },
        },
      };
      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);
      return { body, signature };
    }

    it('should find the order through payment and update status to refunded', async () => {
      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ order_id: 'order-db-id' }],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const { body, signature } = createRefundProcessedWebhook();
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      await POST(req);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining(
          'SELECT order_id FROM payments WHERE razorpay_payment_id'
        ),
        ['pay_test456']
      );

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining(
          "UPDATE orders SET status = 'refunded' WHERE id"
        ),
        ['order-db-id']
      );

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining(
          "UPDATE payments SET status = 'refunded' WHERE razorpay_payment_id"
        ),
        ['pay_test456']
      );
    });

    it('should handle case when payment record is not found', async () => {
      vi.mocked(query).mockResolvedValue({ rowCount: 0, rows: [] } as any);

      const { body, signature } = createRefundProcessedWebhook();
      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      expect(query).not.toHaveBeenCalledWith(
        expect.stringContaining("UPDATE orders SET status = 'refunded'"),
        expect.anything()
      );
    });
  });

  describe('unknown event', () => {
    it('should handle unknown event type without error', async () => {
      const payload = {
        event: 'subscription.cancelled',
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

      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe('error handling', () => {
    it('should return 500 if database query fails during event processing', async () => {
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test123',
              order_id: 'order_test456',
              amount: 99900,
              method: 'upi',
            },
          },
        },
      };
      const body = JSON.stringify(payload);
      const signature = generateWebhookSignature(body, mockWebhookSecret);

      vi.mocked(query).mockRejectedValue(new Error('Database error'));

      const req = new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
        },
        body,
      });

      const res = await POST(req);
      expect(res.status).toBe(500);

      const data = await res.json();
      expect(data.error).toBe('Internal error');
    });
  });
});
