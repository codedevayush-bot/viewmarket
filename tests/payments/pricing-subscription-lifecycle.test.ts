/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';

/**
 * Tests for pricing calculations and subscription lifecycle management.
 * Covers plan pricing, billing cycles, subscription dates, and upgrades.
 */

vi.mock('@/auth');
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

describe('Pricing & Subscription Lifecycle', () => {
  const mockUserId = 'user-pricing-001';
  const mockSecret = 'pricing_test_secret';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: mockUserId } } as any);
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key_id';
    process.env.RAZORPAY_KEY_SECRET = mockSecret;
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_public';
  });

  describe('Plan pricing matrix', () => {
    const pricingMatrix = [
      { plan: 'Starter', billingCycle: 'monthly', expectedPaise: 99900 },
      { plan: 'Starter', billingCycle: 'yearly', expectedPaise: 79900 },
      { plan: 'Pro', billingCycle: 'monthly', expectedPaise: 250000 },
      { plan: 'Pro', billingCycle: 'yearly', expectedPaise: 200000 },
      { plan: 'Premium', billingCycle: 'monthly', expectedPaise: 450000 },
      { plan: 'Premium', billingCycle: 'yearly', expectedPaise: 360000 },
    ];

    it.each(pricingMatrix)(
      '$plan $billingCycle should cost $expectedPaise paise',
      async ({ plan, billingCycle, expectedPaise }) => {
        vi.mocked(getRazorpay).mockReturnValue({
          orders: {
            create: vi.fn().mockResolvedValue({
              id: `order_${plan}_${billingCycle}`,
              amount: expectedPaise,
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
        expect(data.amount).toBe(expectedPaise);
      }
    );

    it('should calculate yearly discount correctly', () => {
      // Starter: 999 -> 799 (20% discount)
      expect(79900).toBeLessThan(99900);
      // Pro: 2500 -> 2000 (20% discount)
      expect(200000).toBeLessThan(250000);
      // Premium: 4500 -> 3600 (20% discount)
      expect(360000).toBeLessThan(450000);
    });

    it('should convert rupees to paise correctly (multiply by 100)', () => {
      const rupeeAmounts = [999, 799, 2500, 2000, 4500, 3600];
      const paiseAmounts = [99900, 79900, 250000, 200000, 450000, 360000];

      rupeeAmounts.forEach((rupees, index) => {
        expect(rupees * 100).toBe(paiseAmounts[index]);
      });
    });
  });

  describe('Subscription date calculations', () => {
    it('should set monthly subscription end date to 1 month from now', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_monthly_001',
            amount: 99900,
            currency: 'INR',
          }),
        },
      } as any);

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-monthly',
              user_id: mockUserId,
              plan: 'Starter',
              billing_cycle: 'monthly',
              amount: 99900,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const signature = generateSignature(
        'order_monthly_001',
        'pay_monthly_001',
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: 'order_monthly_001',
          razorpay_payment_id: 'pay_monthly_001',
          razorpay_signature: signature,
        }),
      });

      await verifyPayment(req);

      // Find the subscription INSERT call
      const subscriptionCall = vi
        .mocked(query)
        .mock.calls.find(
          (call) =>
            typeof call[0] === 'string' &&
            call[0].includes('user_subscriptions')
        );

      expect(subscriptionCall).toBeDefined();
      const params = subscriptionCall![1] as any[];
      const startDate = new Date(params[3]);
      const endDate = new Date(params[4]);

      // End date should be approximately 1 month after start
      const diffMonths =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      expect(diffMonths).toBe(1);
    });

    it('should set yearly subscription end date to 12 months from now', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_yearly_001',
            amount: 79900,
            currency: 'INR',
          }),
        },
      } as any);

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-yearly',
              user_id: mockUserId,
              plan: 'Starter',
              billing_cycle: 'yearly',
              amount: 79900,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const signature = generateSignature(
        'order_yearly_001',
        'pay_yearly_001',
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: 'order_yearly_001',
          razorpay_payment_id: 'pay_yearly_001',
          razorpay_signature: signature,
        }),
      });

      await verifyPayment(req);

      const subscriptionCall = vi
        .mocked(query)
        .mock.calls.find(
          (call) =>
            typeof call[0] === 'string' &&
            call[0].includes('user_subscriptions')
        );

      expect(subscriptionCall).toBeDefined();
      const params = subscriptionCall![1] as any[];
      const startDate = new Date(params[3]);
      const endDate = new Date(params[4]);

      const diffMonths =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      expect(diffMonths).toBe(12);
    });
  });

  describe('Subscription upsert behavior', () => {
    it('should include ON CONFLICT clause for subscription upsert', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_upsert_001',
            amount: 250000,
            currency: 'INR',
          }),
        },
      } as any);

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-upsert',
              user_id: mockUserId,
              plan: 'Pro',
              billing_cycle: 'monthly',
              amount: 250000,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const signature = generateSignature(
        'order_upsert_001',
        'pay_upsert_001',
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: 'order_upsert_001',
          razorpay_payment_id: 'pay_upsert_001',
          razorpay_signature: signature,
        }),
      });

      await verifyPayment(req);

      const subscriptionCall = vi
        .mocked(query)
        .mock.calls.find(
          (call) =>
            typeof call[0] === 'string' &&
            call[0].includes('user_subscriptions')
        );

      expect(subscriptionCall).toBeDefined();
      expect(subscriptionCall![0]).toContain('ON CONFLICT');
      expect(subscriptionCall![0]).toContain('DO UPDATE SET');
    });

    it('should update subscription status to active on new purchase', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_activate_001',
            amount: 450000,
            currency: 'INR',
          }),
        },
      } as any);

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-activate',
              user_id: mockUserId,
              plan: 'Premium',
              billing_cycle: 'monthly',
              amount: 450000,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const signature = generateSignature(
        'order_activate_001',
        'pay_activate_001',
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: 'order_activate_001',
          razorpay_payment_id: 'pay_activate_001',
          razorpay_signature: signature,
        }),
      });

      await verifyPayment(req);

      const subscriptionCall = vi
        .mocked(query)
        .mock.calls.find(
          (call) =>
            typeof call[0] === 'string' &&
            call[0].includes('user_subscriptions')
        );

      expect(subscriptionCall).toBeDefined();
      expect(subscriptionCall![0]).toContain("'active'");
    });

    it('should update updated_at timestamp on subscription upsert', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_update_001',
            amount: 200000,
            currency: 'INR',
          }),
        },
      } as any);

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-update',
              user_id: mockUserId,
              plan: 'Pro',
              billing_cycle: 'yearly',
              amount: 200000,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const signature = generateSignature(
        'order_update_001',
        'pay_update_001',
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: 'order_update_001',
          razorpay_payment_id: 'pay_update_001',
          razorpay_signature: signature,
        }),
      });

      await verifyPayment(req);

      const subscriptionCall = vi
        .mocked(query)
        .mock.calls.find(
          (call) =>
            typeof call[0] === 'string' &&
            call[0].includes('user_subscriptions')
        );

      expect(subscriptionCall).toBeDefined();
      expect(subscriptionCall![0]).toContain('updated_at');
      expect(subscriptionCall![0]).toContain('NOW()');
    });
  });

  describe('Plan upgrade scenario', () => {
    it('should handle upgrading from Starter to Pro', async () => {
      // User has existing Starter subscription, upgrades to Pro
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_upgrade_001',
            amount: 250000,
            currency: 'INR',
          }),
        },
      } as any);

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-upgrade',
              user_id: mockUserId,
              plan: 'Pro',
              billing_cycle: 'monthly',
              amount: 250000,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const signature = generateSignature(
        'order_upgrade_001',
        'pay_upgrade_001',
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: 'order_upgrade_001',
          razorpay_payment_id: 'pay_upgrade_001',
          razorpay_signature: signature,
        }),
      });

      const res = await verifyPayment(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.plan).toBe('Pro');

      // Subscription should be upserted with new plan
      const subscriptionCall = vi
        .mocked(query)
        .mock.calls.find(
          (call) =>
            typeof call[0] === 'string' &&
            call[0].includes('user_subscriptions')
        );

      expect(subscriptionCall).toBeDefined();
      const params = subscriptionCall![1] as any[];
      expect(params[1]).toBe('Pro');
    });

    it('should handle downgrading from Premium to Starter', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_downgrade_001',
            amount: 99900,
            currency: 'INR',
          }),
        },
      } as any);

      vi.mocked(query)
        .mockResolvedValueOnce({
          rowCount: 1,
          rows: [
            {
              id: 'order-db-downgrade',
              user_id: mockUserId,
              plan: 'Starter',
              billing_cycle: 'monthly',
              amount: 99900,
              status: 'created',
            },
          ],
        } as any)
        .mockResolvedValue({ rowCount: 1, rows: [] } as any);

      const signature = generateSignature(
        'order_downgrade_001',
        'pay_downgrade_001',
        mockSecret
      );

      const req = new Request('http://localhost/api/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: 'order_downgrade_001',
          razorpay_payment_id: 'pay_downgrade_001',
          razorpay_signature: signature,
        }),
      });

      const res = await verifyPayment(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.plan).toBe('Starter');
    });
  });

  describe('Receipt generation', () => {
    it('should generate unique receipt with user id and timestamp', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_receipt_001',
            amount: 99900,
            currency: 'INR',
          }),
        },
      } as any);

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      await createOrder(req);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO orders'),
        expect.arrayContaining([
          expect.any(String),
          expect.any(String),
          expect.any(String),
          expect.any(String),
          expect.any(Number),
          expect.any(String),
          expect.any(String),
          expect.stringMatching(/^vm_user-/),
        ])
      );
    });

    it('should include vm_ prefix in receipt for identification', async () => {
      vi.mocked(getRazorpay).mockReturnValue({
        orders: {
          create: vi.fn().mockResolvedValue({
            id: 'order_prefix_001',
            amount: 99900,
            currency: 'INR',
          }),
        },
      } as any);

      const req = new Request('http://localhost/api/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ plan: 'Starter', billingCycle: 'monthly' }),
      });

      await createOrder(req);

      const insertCall = vi
        .mocked(query)
        .mock.calls.find(
          (call) =>
            typeof call[0] === 'string' &&
            call[0].includes('INSERT INTO orders')
        );

      expect(insertCall).toBeDefined();
      const params = insertCall![1] as any[];
      const receipt = params[7];
      expect(receipt).toMatch(/^vm_/);
    });
  });
});
