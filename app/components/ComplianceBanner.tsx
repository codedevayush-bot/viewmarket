'use client';

import styles from './ComplianceBanner.module.css';
import Link from 'next/link';

export default function ComplianceBanner() {
  return (
    <div className={styles.banner} role="alert">
      <div className={styles.bannerInner}>
        <div className={styles.leftSection}>
          <div className={styles.iconWrapper}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className={styles.content}>
            <span className={styles.label}>Important Disclaimer</span>
            <p className={styles.text}>
              ViewMarket is a technology platform only. We are not a
              SEBI-registered broker, investment adviser, research analyst, or
              market-data vendor. All trading, advice, and data are provided
              solely by your connected broker.
            </p>
          </div>
        </div>
        <div className={styles.rightSection}>
          <Link href="/legal/disclaimer" className={styles.link}>
            Read Full Disclaimer
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
