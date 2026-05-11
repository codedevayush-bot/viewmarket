"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./Cart.module.css";
import { Suspense } from "react";

const PLANS = [
  {
    name: "Starter",
    priceMonthly: 999,
    priceYearly: 799,
    description: "Advanced tools and metrics for retail traders.",
  },
  {
    name: "Pro",
    priceMonthly: 2500,
    priceYearly: 2000,
    description: "Built for quantitative developers and serious traders.",
  },
  {
    name: "Premium",
    priceMonthly: 4500,
    priceYearly: 3600,
    description: "The ultimate trading infrastructure for funds.",
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
  const planName = searchParams.get("plan");
  const billingCycle = searchParams.get("billingCycle") || "monthly";

  const selectedPlan = PLANS.find((p) => p.name === planName);

  if (!selectedPlan) {
    return (
      <div className={styles.container}>
        <div
          className={styles.checkoutCard}
          style={{ display: "block", padding: "60px", textAlign: "center" }}
        >
          <h1 className={styles.title}>Selection Expired</h1>
          <p className={styles.subtitle}>
            Please return to the pricing page to select a plan.
          </p>
          <Link
            href="/pricing"
            className={styles.backLink}
            style={{ display: "block", marginTop: "40px" }}
          >
            ← Back to Pricing
          </Link>
        </div>
      </div>
    );
  }

  const price =
    billingCycle === "monthly"
      ? selectedPlan.priceMonthly
      : selectedPlan.priceYearly;
  const total = billingCycle === "monthly" ? price : price * 12;

  return (
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
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

          {billingCycle === "yearly" && (
            <div
              className={styles.summaryItem}
              style={{ color: "var(--text-primary)" }}
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

          <button className={styles.payButton}>Pay Securely</button>

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
