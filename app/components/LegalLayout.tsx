'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './LegalLayout.module.css';

const legalPages = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Disclaimer', href: '/legal/disclaimer' },
  { label: 'Terms of Service', href: '/legal/terms-of-service' },
  { label: 'Risk Disclosure', href: '/legal/risk-disclosure' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Refund Policy', href: '/legal/refund' },
];

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  const pathname = usePathname();

  return (
    <div className={styles.legalPage}>
      <div className={styles.legalContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <p className={styles.sidebarTitle}>Legal</p>
            <ul className={styles.sidebarNav}>
              {legalPages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className={`${styles.sidebarLink} ${
                      pathname === page.href ? styles.sidebarLinkActive : ''
                    }`}
                  >
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className={styles.content}>
          <div className={styles.contentCard}>
            <div className={styles.contentHeader}>
              <h1 className={styles.contentTitle}>{title}</h1>
              <p className={styles.contentUpdated}>
                Last updated: {lastUpdated}
              </p>
            </div>
            <div className={styles.contentBody}>{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
