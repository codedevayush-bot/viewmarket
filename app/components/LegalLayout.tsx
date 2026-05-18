'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import styles from './LegalLayout.module.css';

const legalPages = [
  { label: 'Privacy Policy', href: '/legal/privacy' },
  { label: 'Disclaimer', href: '/legal/disclaimer' },
  { label: 'Terms of Service', href: '/legal/terms-of-service' },
  { label: 'Risk Disclosure', href: '/legal/risk-disclosure' },
  { label: 'Cookie Policy', href: '/legal/cookies' },
  { label: 'Refund Policy', href: '/legal/refund' },
];

interface Section {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  title: string;
  description?: string;
  lastUpdated: string;
  sections: Section[];
  children: React.ReactNode;
}

export default function LegalLayout({
  title,
  description,
  lastUpdated,
  sections,
  children,
}: LegalLayoutProps) {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections, children]);

  return (
    <div className={styles.legalPage}>
      {/* Top Navigation Bar */}
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
            Back
          </Link>

          <span className={styles.legalPageName}>Legal</span>

          <Link href="/" className={styles.legalLogo}>
            <svg
              width="20"
              height="20"
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
      <div className={styles.legalContainer}>
        {/* Fixed Header Area */}
        <div className={styles.fixedHeader}>
          {/* Horizontal Navigation */}
          <nav className={styles.pageNav} aria-label="Legal pages">
            {legalPages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className={`${styles.pageNavLink} ${
                  pathname === page.href ? styles.pageNavLinkActive : ''
                }`}
              >
                {page.label}
              </Link>
            ))}
          </nav>

          {/* Content Header */}
          <header className={styles.contentHeader}>
            <div className={styles.headerTop}>
              <span className={styles.headerLabel}>Legal</span>
              <span className={styles.headerDivider}>·</span>
              <time className={styles.headerDate}>{lastUpdated}</time>
            </div>
            <h1 className={styles.contentTitle}>{title}</h1>
            {description && (
              <p className={styles.contentDescription}>{description}</p>
            )}
          </header>
        </div>

        {/* Scrollable Content Area */}
        <div className={styles.scrollableContent}>
          {/* Main Content with ToC Sidebar */}
          <div className={styles.contentWrapper}>
            {/* Table of Contents Sidebar */}
            <aside className={styles.tocSidebar}>
              <div className={styles.tocInner}>
                <span className={styles.tocLabel}>On this page</span>
                <nav className={styles.tocNav}>
                  {sections.map(({ id, label }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={`${styles.tocLink} ${
                        activeId === id ? styles.tocLinkActive : ''
                      }`}
                    >
                      {label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content Body */}
            <main className={styles.contentBody} ref={contentRef}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
