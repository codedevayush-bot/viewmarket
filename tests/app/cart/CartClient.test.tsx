/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import CartClient from '@/app/cart/CartClient';

const mockPush = vi.fn();
const mockSearchParamsGet = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
  usePathname: () => '',
}));

vi.mock('@/app/cart/Cart.module.css', () => ({
  default: {
    container: 'container',
    checkoutCard: 'checkoutCard',
    infoSection: 'infoSection',
    brand: 'brand',
    logo: 'logo',
    brandName: 'brandName',
    header: 'header',
    title: 'title',
    subtitle: 'subtitle',
    planDisplay: 'planDisplay',
    planName: 'planName',
    planDesc: 'planDesc',
    paymentSection: 'paymentSection',
    summaryTitle: 'summaryTitle',
    summaryItem: 'summaryItem',
    label: 'label',
    divider: 'divider',
    totalRow: 'totalRow',
    totalLabel: 'totalLabel',
    totalAmount: 'totalAmount',
    payButton: 'payButton',
    backLink: 'backLink',
    secureNote: 'secureNote',
    billingBadge: 'billingBadge',
  },
}));

const mockRazorpayOpen = vi.fn();
const mockRazorpayOn = vi.fn();

function MockRazorpayCtor(this: any, options: any) {
  (globalThis as any).__razorpayOptions = options;
  this.open = mockRazorpayOpen;
  this.on = mockRazorpayOn;
}

describe('CartClient Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSearchParamsGet.mockImplementation((key: string) => {
      if (key === 'plan') return 'Pro';
      if (key === 'billingCycle') return 'monthly';
      return null;
    });
    (globalThis as any).window.Razorpay = MockRazorpayCtor;
    delete (globalThis as any).__razorpayOptions;
  });

  describe('Rendering', () => {
    it('renders the checkout page with selected plan', () => {
      render(<CartClient />);

      expect(screen.getByText('Complete Subscription')).toBeTruthy();
      expect(screen.getAllByText('Pro').length).toBeGreaterThan(0);
    });

    it('shows the billing cycle badge', () => {
      render(<CartClient />);

      expect(screen.getByText('monthly')).toBeTruthy();
    });

    it('displays the plan description', () => {
      render(<CartClient />);

      expect(
        screen.getByText(
          'Built for quantitative developers and serious traders.'
        )
      ).toBeTruthy();
    });

    it('shows the correct monthly rate for Pro plan', () => {
      render(<CartClient />);

      expect(screen.getByText(/\u20B92,500 \/ mo/)).toBeTruthy();
    });

    it('shows the correct total for monthly billing', () => {
      render(<CartClient />);

      expect(screen.getByText('\u20B92,500')).toBeTruthy();
    });

    it('shows annual discount for yearly billing', () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'plan') return 'Pro';
        if (key === 'billingCycle') return 'yearly';
        return null;
      });

      render(<CartClient />);

      expect(screen.getByText('Annual Discount')).toBeTruthy();
      expect(screen.getByText('-20% included')).toBeTruthy();
    });

    it('shows the correct total for yearly billing (price * 12)', () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'plan') return 'Pro';
        if (key === 'billingCycle') return 'yearly';
        return null;
      });

      render(<CartClient />);

      expect(screen.getByText('\u20B924,000')).toBeTruthy();
    });

    it('renders the Pay Securely button', () => {
      render(<CartClient />);

      expect(
        screen.getByRole('button', { name: /Pay Securely/i })
      ).toBeTruthy();
    });

    it('renders the Change Plan link', () => {
      render(<CartClient />);

      expect(screen.getByText(/\u2190 Change Plan/i)).toBeTruthy();
    });

    it('renders the secure encryption note', () => {
      render(<CartClient />);

      expect(screen.getByText('Bank-level 256-bit encryption')).toBeTruthy();
    });

    it('shows "Selection Expired" when no plan is selected', () => {
      mockSearchParamsGet.mockReturnValue(null);

      render(<CartClient />);

      expect(screen.getByText('Selection Expired')).toBeTruthy();
      expect(
        screen.getByText(/Please return to the pricing page/)
      ).toBeTruthy();
    });
  });

  describe('Payment Flow', () => {
    it('calls create-order API when Pay Securely is clicked', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            orderId: 'order_test123',
            amount: 250000,
            currency: 'INR',
            keyId: 'rzp_test_key',
          }),
      });
      vi.stubGlobal('fetch', mockFetch);

      render(<CartClient />);

      const payButton = screen.getByRole('button', { name: /Pay Securely/i });
      await act(async () => {
        fireEvent.click(payButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/payments/create-order',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ plan: 'Pro', billingCycle: 'monthly' }),
          })
        );
      });

      vi.unstubAllGlobals();
    });

    it('opens Razorpay checkout after order creation', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            orderId: 'order_test123',
            amount: 250000,
            currency: 'INR',
            keyId: 'rzp_test_key',
          }),
      });
      vi.stubGlobal('fetch', mockFetch);

      render(<CartClient />);

      const payButton = screen.getByRole('button', { name: /Pay Securely/i });
      await act(async () => {
        fireEvent.click(payButton);
      });

      await waitFor(() => {
        expect((globalThis as any).__razorpayOptions).toBeDefined();
      });

      const options = (globalThis as any).__razorpayOptions;
      expect(options.key).toBe('rzp_test_key');
      expect(options.amount).toBe(250000);
      expect(options.currency).toBe('INR');
      expect(options.name).toBe('ViewMarket');
      expect(options.order_id).toBe('order_test123');

      vi.unstubAllGlobals();
    });

    it('calls verify API after successful Razorpay payment', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url === '/api/payments/create-order') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                orderId: 'order_test123',
                amount: 250000,
                currency: 'INR',
                keyId: 'rzp_test_key',
              }),
          });
        }
        if (url === '/api/payments/verify') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({ ok: false });
      });
      vi.stubGlobal('fetch', mockFetch);

      render(<CartClient />);

      const payButton = screen.getByRole('button', { name: /Pay Securely/i });
      await act(async () => {
        fireEvent.click(payButton);
      });

      await waitFor(() => {
        expect((globalThis as any).__razorpayOptions).toBeDefined();
      });

      const options = (globalThis as any).__razorpayOptions;
      await act(async () => {
        options.handler({
          razorpay_order_id: 'order_test123',
          razorpay_payment_id: 'pay_test456',
          razorpay_signature: 'sig_test789',
        });
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/payments/verify',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: 'order_test123',
              razorpay_payment_id: 'pay_test456',
              razorpay_signature: 'sig_test789',
            }),
          })
        );
      });

      vi.unstubAllGlobals();
    });

    it('redirects to dashboard after successful verification', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url === '/api/payments/create-order') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                orderId: 'order_test123',
                amount: 250000,
                currency: 'INR',
                keyId: 'rzp_test_key',
              }),
          });
        }
        if (url === '/api/payments/verify') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({ ok: false });
      });
      vi.stubGlobal('fetch', mockFetch);

      render(<CartClient />);

      const payButton = screen.getByRole('button', { name: /Pay Securely/i });
      await act(async () => {
        fireEvent.click(payButton);
      });

      await waitFor(() => {
        expect((globalThis as any).__razorpayOptions).toBeDefined();
      });

      const options = (globalThis as any).__razorpayOptions;
      await act(async () => {
        options.handler({
          razorpay_order_id: 'order_test123',
          razorpay_payment_id: 'pay_test456',
          razorpay_signature: 'sig_test789',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/user-dashboard');
      });

      vi.unstubAllGlobals();
    });
  });

  describe('Error Handling', () => {
    it('displays error when order creation fails', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Payment gateway unavailable' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      render(<CartClient />);

      const payButton = screen.getByRole('button', { name: /Pay Securely/i });
      await act(async () => {
        fireEvent.click(payButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Payment gateway unavailable')).toBeTruthy();
      });

      vi.unstubAllGlobals();
    });

    it('displays error when payment verification fails', async () => {
      const mockFetch = vi.fn().mockImplementation((url: string) => {
        if (url === '/api/payments/create-order') {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                orderId: 'order_test123',
                amount: 250000,
                currency: 'INR',
                keyId: 'rzp_test_key',
              }),
          });
        }
        if (url === '/api/payments/verify') {
          return Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ error: 'Invalid signature' }),
          });
        }
        return Promise.resolve({ ok: false });
      });
      vi.stubGlobal('fetch', mockFetch);

      render(<CartClient />);

      const payButton = screen.getByRole('button', { name: /Pay Securely/i });
      await act(async () => {
        fireEvent.click(payButton);
      });

      await waitFor(() => {
        expect((globalThis as any).__razorpayOptions).toBeDefined();
      });

      const options = (globalThis as any).__razorpayOptions;
      await act(async () => {
        options.handler({
          razorpay_order_id: 'order_test123',
          razorpay_payment_id: 'pay_test456',
          razorpay_signature: 'sig_test789',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('Invalid signature')).toBeTruthy();
      });

      vi.unstubAllGlobals();
    });

    it('resets processing state when checkout modal is dismissed', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            orderId: 'order_test123',
            amount: 250000,
            currency: 'INR',
            keyId: 'rzp_test_key',
          }),
      });
      vi.stubGlobal('fetch', mockFetch);

      render(<CartClient />);

      const payButton = screen.getByRole('button', { name: /Pay Securely/i });
      await act(async () => {
        fireEvent.click(payButton);
      });

      await waitFor(() => {
        expect((globalThis as any).__razorpayOptions).toBeDefined();
      });

      const options = (globalThis as any).__razorpayOptions;
      await act(async () => {
        options.modal.ondismiss();
      });

      expect(
        screen.getByRole('button', { name: /Pay Securely/i })
      ).not.toBeDisabled();

      vi.unstubAllGlobals();
    });

    it('disables button and shows processing text during payment', async () => {
      let resolvePromise: () => void;
      const mockFetch = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve;
        });
      });
      vi.stubGlobal('fetch', mockFetch);

      render(<CartClient />);

      const payButton = screen.getByRole('button', { name: /Pay Securely/i });
      await act(async () => {
        fireEvent.click(payButton);
      });

      await waitFor(() => {
        expect(payButton).toBeDisabled();
        expect(screen.getByText(/Processing/i)).toBeTruthy();
      });

      resolvePromise!();
      vi.unstubAllGlobals();
    });
  });

  describe('Plan Pricing', () => {
    it('calculates Starter monthly correctly', () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'plan') return 'Starter';
        if (key === 'billingCycle') return 'monthly';
        return null;
      });

      render(<CartClient />);

      expect(screen.getByText('\u20B9999')).toBeTruthy();
    });

    it('calculates Starter yearly correctly (799 * 12)', () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'plan') return 'Starter';
        if (key === 'billingCycle') return 'yearly';
        return null;
      });

      render(<CartClient />);

      expect(screen.getByText('\u20B99,588')).toBeTruthy();
    });

    it('calculates Premium monthly correctly', () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'plan') return 'Premium';
        if (key === 'billingCycle') return 'monthly';
        return null;
      });

      render(<CartClient />);

      expect(screen.getByText('\u20B94,500')).toBeTruthy();
    });

    it('calculates Premium yearly correctly (3600 * 12)', () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === 'plan') return 'Premium';
        if (key === 'billingCycle') return 'yearly';
        return null;
      });

      render(<CartClient />);

      expect(screen.getByText('\u20B943,200')).toBeTruthy();
    });
  });
});
