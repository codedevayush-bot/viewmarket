"use client";

import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./ProfileDropdown.module.css";

export default function ProfileDropdown() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending close timeout
  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  // Open dropdown on hover
  const handleMouseEnter = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  // Close dropdown with delay (allows moving mouse to dropdown)
  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // 200ms delay before closing
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Handle sign out
  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (session?.user?.name) {
      return session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return session?.user?.email?.[0]?.toUpperCase() || "U";
  };

  // Show loading state
  if (status === "loading") {
    return (
      <div className={styles.profileContainer}>
        <div className={styles.avatarSkeleton} />
      </div>
    );
  }

  // Not authenticated - don't show anything (Navbar handles sign-in button)
  if (status === "unauthenticated" || !session) {
    return null;
  }

  return (
    <div
      className={styles.profileContainer}
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar Button */}
      <button
        ref={buttonRef}
        className={styles.avatarButton}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
        title={`${session.user?.name || "User"} - Hover for menu`}
      >
        {session.user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className={styles.avatarImage}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.avatarFallback}>{getUserInitials()}</div>
        )}

        {/* Online/Active Indicator */}
        <span className={styles.statusIndicator} aria-label="Active" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={styles.dropdown}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* User Info Header */}
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className={styles.userAvatarImage}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={styles.userAvatarFallback}>
                  {getUserInitials()}
                </div>
              )}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{session.user?.name || "User"}</p>
              <p className={styles.userEmail} title={session.user?.email || ""}>
                {session.user?.email}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Menu Items */}
          <nav className={styles.menu}>
            <Link
              href="/user-dashboard"
              className={styles.menuItem}
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
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
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </nav>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className={`${styles.menuItem} ${styles.signOut}`}
            role="menuitem"
          >
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
