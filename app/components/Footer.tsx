import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          {/* Logo Column */}
          <div className={styles.footerColumn}>
            <div className={styles.logoRow}>
              <div className={styles.logo}>
                <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                  <path d="M50 8 L92 50 L50 92 L8 50 Z" fill="currentColor" />
                  <path
                    d="M50 28 L72 50 L50 72 L28 50 Z"
                    fill="var(--bg-page)"
                  />
                </svg>
              </div>
              <span className={styles.logoText}>View Market</span>
            </div>
          </div>

          {/* Product Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Product</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.footerLink}>
                  Intake
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Plan
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Build
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Diffs
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Monitor
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Security
                </a>
              </li>
            </ul>
          </div>

          {/* Features Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Features</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.footerLink}>
                  Asks
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Agents
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Customer Requests
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Insights
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Mobile
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Company</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.footerLink}>
                  About
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Customers
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Method
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Quality
                </a>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Brand
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Legal</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href="/legal/privacy" className={styles.footerLink}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/legal/disclaimer" className={styles.footerLink}>
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms-of-service"
                  className={styles.footerLink}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/risk-disclosure"
                  className={styles.footerLink}
                >
                  Risk Disclosure
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className={styles.footerLink}>
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/legal/refund" className={styles.footerLink}>
                  Refund
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className={styles.footerColumn}>
            <h3 className={styles.columnTitle}>Contact Us</h3>
            <ul className={styles.linkList}>
              <li>
                <a href="#" className={styles.footerLink}>
                  Raise a ticket
                </a>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  Email us
                </Link>
              </li>
              <li>
                <a href="#" className={styles.footerLink}>
                  Get a call
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Links */}
        <div className={styles.footerBottom}>
          <Link href="/legal/privacy" className={styles.bottomLink}>
            Privacy
          </Link>
          <Link href="/legal/terms-of-service" className={styles.bottomLink}>
            Terms
          </Link>
          <Link href="/legal/disclaimer" className={styles.bottomLink}>
            Disclaimer
          </Link>
        </div>
      </div>
    </footer>
  );
}
