import { test, expect } from '@playwright/test';

test.describe('Razorpay Payment Gateway E2E', () => {
  test.describe('Cart/Checkout Page', () => {
    test('should display checkout page with Pro plan details', async ({
      page,
    }) => {
      await page.goto('/cart?plan=Pro&billingCycle=monthly');

      await expect(page.getByText('Complete Subscription')).toBeVisible();
      await expect(page.getByText('Pro')).toBeVisible();
      await expect(page.getByText('monthly')).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Pay Securely/i })
      ).toBeVisible();
    });

    test('should show Selection Expired when no plan is provided', async ({
      page,
    }) => {
      await page.goto('/cart');

      await expect(page.getByText('Selection Expired')).toBeVisible();
      await expect(
        page.getByText('Please return to the pricing page')
      ).toBeVisible();
    });

    test('should display correct pricing for yearly billing', async ({
      page,
    }) => {
      await page.goto('/cart?plan=Pro&billingCycle=yearly');

      await expect(page.getByText('Annual Discount')).toBeVisible();
      await expect(page.getByText('-20% included')).toBeVisible();
    });

    test('should have Change Plan link that navigates to pricing', async ({
      page,
    }) => {
      await page.goto('/cart?plan=Pro&billingCycle=monthly');

      const changePlanLink = page.getByRole('link', { name: /Change Plan/i });
      await expect(changePlanLink).toBeVisible();
      await expect(changePlanLink).toHaveAttribute('href', '/pricing');
    });
  });

  test.describe('Payment API Endpoints', () => {
    test('create-order endpoint should return 401 without authentication', async ({
      request,
    }) => {
      const response = await request.post('/api/payments/create-order', {
        data: { plan: 'Pro', billingCycle: 'monthly' },
      });

      expect(response.status()).toBe(401);
    });

    test('create-order endpoint should return 400 for invalid plan', async ({
      request,
    }) => {
      const response = await request.post('/api/payments/create-order', {
        data: { plan: 'Invalid', billingCycle: 'monthly' },
      });

      expect(response.status()).toBe(400);
    });

    test('verify endpoint should return 401 without authentication', async ({
      request,
    }) => {
      const response = await request.post('/api/payments/verify', {
        data: {
          razorpay_order_id: 'order_test',
          razorpay_payment_id: 'pay_test',
          razorpay_signature: 'sig_test',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('verify endpoint should return 400 for missing fields', async ({
      request,
    }) => {
      const response = await request.post('/api/payments/verify', {
        data: { razorpay_order_id: 'order_test' },
      });

      expect(response.status()).toBe(400);
    });

    test('webhook endpoint should return 400 without signature', async ({
      request,
    }) => {
      const response = await request.post('/api/payments/webhook', {
        data: { event: 'payment.captured', payload: {} },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Payment Flow Integration', () => {
    test('should handle order creation failure gracefully', async ({
      page,
    }) => {
      await page.route('**/api/payments/create-order', async (route) => {
        await route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Payment gateway unavailable' }),
        });
      });

      await page.goto('/cart?plan=Pro&billingCycle=monthly');

      await page.getByRole('button', { name: /Pay Securely/i }).click();

      await expect(page.getByText('Payment gateway unavailable')).toBeVisible();
    });

    test('should show processing state when payment is initiated', async ({
      page,
    }) => {
      await page.route('**/api/payments/create-order', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            orderId: 'order_test',
            amount: 250000,
            currency: 'INR',
            keyId: 'rzp_test',
          }),
        });
      });

      await page.goto('/cart?plan=Pro&billingCycle=monthly');

      await page.getByRole('button', { name: /Pay Securely/i }).click();

      await expect(page.getByText(/Processing/i)).toBeVisible();
    });
  });
});
