'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../components/LegalLayout.module.css';

const legalPages = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Disclaimer', href: '/legal/disclaimer' },
  { label: 'Terms of Service', href: '/legal/terms-of-service' },
  { label: 'Risk Disclosure', href: '/legal/risk-disclosure' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Refund Policy', href: '/legal/refund' },
];

export default function LegalRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const currentPage = legalPages.find((p) => p.href === pathname);

  return (
    <>
      {/* Legal Navbar */}
      <header className={styles.legalNavbar}>
        <nav className={styles.legalNavbarInner}>
          <Link href="/" className={styles.backToHome}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Home
          </Link>

          {currentPage && (
            <span className={styles.legalPageName}>{currentPage.label}</span>
          )}

          <Link href="/" className={styles.legalLogo}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M50 8 L92 50 L50 92 L8 50 Z" fill="currentColor" />
              <path
                d="M50 28 L72 50 L50 72 L28 50 Z"
                style={{ fill: 'var(--bg-page)' }}
              />
            </svg>
            <span className={styles.legalLogoText}>ViewMarket</span>
          </Link>
        </nav>
      </header>

      {/* Page Content */}
      {children}
    </>
  );
}
