"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import styles from "./SessionTimeoutWarning.module.css";

const SESSION_WARNING_THRESHOLD = 5 * 60 * 1000; // Show warning 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export default function SessionTimeoutWarning() {
  const { data: session, update } = useSession();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    if (!session?.expires) return null;

    const expiryTime = new Date(session.expires).getTime();
    const now = Date.now();
    const remaining = expiryTime - now;

    return Math.max(0, remaining);
  }, [session]);

  useEffect(() => {
    if (!session?.expires) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(null);
      setShowWarning(false);
      return;
    }

    const checkSession = () => {
      const remaining = calculateTimeLeft();

      if (remaining === null) return;

      setTimeLeft(remaining);

      // Show warning when less than 5 minutes left
      if (remaining <= SESSION_WARNING_THRESHOLD && remaining > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }

      // Auto logout when session expires
      if (remaining <= 0) {
        signOut({ callbackUrl: "/sign-in?error=SessionExpired" });
      }
    };

    checkSession();
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [session, calculateTimeLeft]);

  const handleExtendSession = async () => {
    // Update session to extend it
    await update();
    setShowWarning(false);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  if (!showWarning || timeLeft === null) return null;

  const minutes = Math.floor(timeLeft / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className={styles.warningOverlay} role="alert" aria-live="polite">
      <div className={styles.warningCard}>
        <div className={styles.warningIcon}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h3 className={styles.warningTitle}>Session Expiring Soon</h3>
        <p className={styles.warningMessage}>
          Your session will expire in{" "}
          <span className={styles.timeRemaining}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
          {". "}For security reasons, you will be automatically logged out.
        </p>

        <div className={styles.warningActions}>
          <button
            onClick={handleExtendSession}
            className={styles.extendButton}
            autoFocus
          >
            Stay Signed In
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
