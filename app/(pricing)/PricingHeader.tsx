'use client';

import Link from 'next/link';
import styles from './PricingHeader.module.css';

export default function PricingHeader() {
  return (
    <header className={styles.headerRoot}>
      <nav className={styles.headerInner} aria-label="Pricing navigation">
        {/* ── Back to Home ── */}
        <Link href="/" className={styles.backBtn} aria-label="Back to home">
          <svg
            className={styles.backIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Home
        </Link>

        {/* ── Company Brand ── */}
        <Link href="/" className={styles.brand} aria-label="View Market home">
          <svg
            width="28"
            height="28"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M50 8 L92 50 L50 92 L8 50 Z" fill="var(--logo-diamond)" />
            <path d="M50 28 L72 50 L50 72 L28 50 Z" fill="var(--bg-page)" />
          </svg>
          <span className={styles.brandText}>View Market</span>
        </Link>
      </nav>
    </header>
  );
}
