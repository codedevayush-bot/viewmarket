'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import styles from './Cart.module.css';
import { Suspense, useState, useEffect } from 'react';

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: { error?: Error }) => void) => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const PLANS = [
  {
    name: 'Starter',
    priceMonthly: 999,
    priceYearly: 799,
    description: 'Advanced tools and metrics for retail traders.',
  },
  {
    name: 'Pro',
    priceMonthly: 2500,
    priceYearly: 2000,
    description: 'Built for quantitative developers and serious traders.',
  },
  {
    name: 'Premium',
    priceMonthly: 4500,
    priceYearly: 3600,
    description: 'The ultimate trading infrastructure for funds.',
  },
];

const LockIcon = () => (
  <svg
    width="12"
    height="12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

function CartContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planName = searchParams.get('plan');
  const billingCycle = searchParams.get('billingCycle') || 'monthly';

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(
    typeof window !== 'undefined' && !!window.Razorpay
  );

  useEffect(() => {
    if (window.Razorpay) return;

    const checkLoaded = setInterval(() => {
      if (window.Razorpay) {
        setIsRazorpayLoaded(true);
        clearInterval(checkLoaded);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkLoaded);
      if (!window.Razorpay) {
        setError('Payment system not available. Please refresh the page.');
      }
    }, 10000);

    return () => {
      clearInterval(checkLoaded);
      clearTimeout(timeout);
    };
  }, []);

  const selectedPlan = PLANS.find((p) => p.name === planName);

  if (!selectedPlan) {
    return (
      <div className={styles.container}>
        <div
          className={styles.checkoutCard}
          style={{ display: 'block', padding: '60px', textAlign: 'center' }}
        >
          <h1 className={styles.title}>Selection Expired</h1>
          <p className={styles.subtitle}>
            Please return to the pricing page to select a plan.
          </p>
          <Link
            href="/pricing"
            className={styles.backLink}
            style={{ display: 'block', marginTop: '40px' }}
          >
            ← Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  const price =
    billingCycle === 'monthly'
      ? selectedPlan.priceMonthly
      : selectedPlan.priceYearly;
  const total = billingCycle === 'monthly' ? price : price * 12;

  async function handlePayment() {
    setIsProcessing(true);
    setError(null);

    if (!window.Razorpay) {
      setError('Payment system not ready. Please refresh the page.');
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan!.name,
          billingCycle,
        }),
      });

      if (!orderRes.ok) {
        const data = await orderRes.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const { orderId, amount, currency, keyId } = await orderRes.json();

      // 2. Open Razorpay checkout
      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'ViewMarket',
        description: `${selectedPlan!.name} — ${billingCycle}`,
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // 3. Verify payment on server
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });

            if (!verifyRes.ok) {
              const data = await verifyRes.json();
              throw new Error(data.error || 'Payment verification failed');
            }

            // 4. Redirect to dashboard on success
            router.push('/user-dashboard');
          } catch (verifyError) {
            setError(
              verifyError instanceof Error
                ? verifyError.message
                : 'Payment verification failed. Contact support.'
            );
          }
        },
        prefill: {
          email: undefined,
        },
        theme: {
          color: '#18181b',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      });

      razorpay.on('modal', (e) => {
        if (e.error) {
          setError('Payment window closed unexpectedly.');
          setIsProcessing(false);
        }
      });

      razorpay.open();
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Something went wrong. Please try again.'
      );
      setIsProcessing(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setIsRazorpayLoaded(true)}
      />
      <div className={styles.container}>
        <div className={styles.checkoutCard}>
          {/* Left Side */}
          <div className={styles.infoSection}>
            <div className={styles.brand}>
              <div className={styles.logo} />
              <span className={styles.brandName}>ViewMarket</span>
            </div>

            <div className={styles.header}>
              <h1 className={styles.title}>Complete Subscription</h1>
              <p className={styles.subtitle}>
                Review your plan details and secure your access.
              </p>
            </div>

            <div className={styles.planDisplay}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <h2 className={styles.planName}>{selectedPlan.name}</h2>
                <span className={styles.billingBadge}>{billingCycle}</span>
              </div>
              <p className={styles.planDesc}>{selectedPlan.description}</p>
            </div>
          </div>

          {/* Right Side */}
          <div className={styles.paymentSection}>
            <h2 className={styles.summaryTitle}>Payment Summary</h2>

            <div className={styles.summaryItem}>
              <span className={styles.label}>Subscription</span>
              <span>{selectedPlan.name}</span>
            </div>

            <div className={styles.summaryItem}>
              <span className={styles.label}>Rate</span>
              <span>₹{price.toLocaleString()} / mo</span>
            </div>

            {billingCycle === 'yearly' && (
              <div
                className={styles.summaryItem}
                style={{ color: 'var(--text-primary)' }}
              >
                <span className={styles.label}>Annual Discount</span>
                <span>-20% included</span>
              </div>
            )}

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalAmount}>
                ₹{total.toLocaleString()}
              </span>
            </div>

            {error && (
              <p
                style={{
                  color: '#ef4444',
                  fontSize: '13px',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}
              >
                {error}
              </p>
            )}

            <button
              className={styles.payButton}
              onClick={handlePayment}
              disabled={isProcessing || !isRazorpayLoaded}
              style={{ opacity: isProcessing || !isRazorpayLoaded ? 0.7 : 1 }}
            >
              {!isRazorpayLoaded
                ? 'Loading Payment System...'
                : isProcessing
                  ? 'Processing…'
                  : 'Pay Securely'}
            </button>

            <div className={styles.secureNote}>
              <LockIcon />
              <span>Bank-level 256-bit encryption</span>
            </div>

            <Link href="/pricing" className={styles.backLink}>
              ← Change Plan
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CartClient() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <p>Loading Checkout...</p>
        </div>
      }
    >
      <CartContent />
    </Suspense>
  );
}
