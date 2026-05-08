"use client";

import styles from "./CopyTrading.module.css";

export default function CopyTradingPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.badge}>Coming Soon</div>
        <h1 className={styles.title}>Copy Trading</h1>
        <p className={styles.description}>
          The most advanced multi-broker copy trading infrastructure is
          currently under development. Bridge multiple accounts, synchronize
          orders, and scale your strategies effortlessly.
        </p>
        <div className={styles.features}>
          <div className={styles.featureItem}>
            <div className={styles.dot}></div>
            <span>Multi-Account Sync</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.dot}></div>
            <span>Low Latency Execution</span>
          </div>
          <div className={styles.featureItem}>
            <div className={styles.dot}></div>
            <span>Advanced Risk Management</span>
          </div>
        </div>
        <button className={styles.notifyButton}>Get Notified</button>
      </div>

      {/* Abstract Background Elements */}
      <div className={styles.glow}></div>
    </div>
  );
}
