"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import ProfileDropdown from "./ProfileDropdown";
import styles from "./Navbar.module.css";

const navLinks = [
  { label: "Product", href: "#" },
  { label: "Resources", href: "#" },
  { label: "Customers", href: "#" },
  { label: "Pricing", href: "/pricing" },
  { label: "Now", href: "#" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status } = useSession();

  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return (
    <header className={styles.navbarRoot}>
      <nav className={styles.navbarInner} aria-label="Main navigation">
        {/* ── Logo ── */}
        <Link
          href="/"
          className={styles.navbarLogo}
          aria-label="View Market home"
        >
          {/* View Market logo - prism diamond */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Diamond shape */}
            <path d="M50 8 L92 50 L50 92 L8 50 Z" fill="white" />
            {/* Inner cutout - creates prism effect */}
            <path d="M50 28 L72 50 L50 72 L28 50 Z" fill="black" />
          </svg>
          <span className={styles.navbarLogoText}>View Market</span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <ul className={styles.navbarLinks} role="list">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className={styles.navbarLink}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Auth Actions ── */}
        <div className={styles.navbarActions}>
          <div className={styles.navbarDivider} aria-hidden="true" />

          {isLoading ? (
            // Loading state
            <div className={styles.loadingSkeleton} />
          ) : isAuthenticated ? (
            // Authenticated: Show Profile Dropdown
            <ProfileDropdown />
          ) : (
            // Not authenticated: Show Sign In button
            <Link href="/sign-in" className={styles.navbarLogin}>
              Sign in
            </Link>
          )}
        </div>

        {/* ── Mobile Hamburger ── */}
        <button
          id="navbar-mobile-toggle"
          className={styles.navbarHamburger}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span
            className={`${styles.hamburgerLine} ${mobileOpen ? styles.openTop : ""}`}
          />
          <span
            className={`${styles.hamburgerLine} ${mobileOpen ? styles.openMid : ""}`}
          />
          <span
            className={`${styles.hamburgerLine} ${mobileOpen ? styles.openBot : ""}`}
          />
        </button>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div
          className={styles.navbarMobileMenu}
          role="dialog"
          aria-label="Mobile navigation"
        >
          <ul role="list">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className={styles.navbarMobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.navbarMobileAuth}>
            {isAuthenticated ? (
              // Mobile: Authenticated user actions
              <>
                <Link
                  href="/user-dashboard"
                  className={styles.navbarMobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/user-dashboard/settings"
                  className={styles.navbarMobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  Settings
                </Link>
                <div className={styles.navbarMobileDivider} />
                <Link
                  href="/api/auth/signout"
                  className={`${styles.navbarMobileLink} ${styles.navbarMobileSignOut}`}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign out
                </Link>
              </>
            ) : (
              // Mobile: Not authenticated
              <Link
                href="/sign-in"
                className={styles.navbarLogin}
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
