import styles from './LogoSection.module.css';

export default function LogoSection() {
  return (
    <>
      {/* Top Divider */}
      <div className={styles.sectionDivider}></div>

      <section className={styles.logoSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logoItem}>
            <span className={`${styles.logoText} ${styles.interactive}`}>
              IBKR
            </span>
          </div>
          <div className={styles.logoItem}>
            <span className={`${styles.logoText} ${styles.binance}`}>
              BINANCE
            </span>
          </div>
          <div className={styles.logoItem}>
            <span className={`${styles.logoText} ${styles.coinbase}`}>
              coinbase
            </span>
          </div>
          <div className={styles.logoItem}>
            <span className={`${styles.logoText} ${styles.zerodha}`}>
              ZERODHA
            </span>
          </div>
          <div className={styles.logoItem}>
            <span className={`${styles.logoText} ${styles.alpaca}`}>
              ALPACA
            </span>
          </div>
          <div className={styles.logoItem}>
            <span className={`${styles.logoText} ${styles.stripe}`}>
              stripe
            </span>
          </div>
          <div className={styles.logoItem}>
            <span className={`${styles.logoText} ${styles.plaid}`}>plaid</span>
          </div>
          <div className={styles.logoItem}>
            <span className={`${styles.logoText} ${styles.kraken}`}>
              KRAKEN
            </span>
          </div>
        </div>
      </section>

      {/* Bottom Divider */}
      <div className={styles.sectionDivider}></div>
    </>
  );
}
