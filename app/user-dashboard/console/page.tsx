"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "../UserDashboard.module.css";

export default function ConsolePage() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading Console...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Console</h1>
        <p className={styles.subtitle}>
          System overview for{" "}
          {session?.user?.name || session?.user?.email || "User"}
        </p>
      </header>

      {/* Stats Grid - Focused on Trading & System Usage */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>12</div>
          <div className={styles.statLabel}>Strategies Deployed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>4</div>
          <div className={styles.statLabel}>Active Brokers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>8</div>
          <div className={styles.statLabel}>Live Orders</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>1.2GB</div>
          <div className={styles.statLabel}>System Memory</div>
        </div>
      </div>

      {/* Account Info Card */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Information</h2>
        <div className={styles.userInfoCard}>
          <div className={styles.userInfoRow}>
            <span className={styles.userInfoLabel}>Status:</span>
            <span
              className={styles.userInfoValue}
              style={{ color: "var(--text-full)" }}
            >
              Authenticated
            </span>
          </div>
          <div className={styles.userInfoRow}>
            <span className={styles.userInfoLabel}>Email:</span>
            <span className={styles.userInfoValue}>
              {session?.user?.email || "Not provided"}
            </span>
          </div>
          <div className={styles.userInfoRow}>
            <span className={styles.userInfoLabel}>Last Login:</span>
            <span className={styles.userInfoValue}>
              {mounted ? (
                <>
                  {new Date().toLocaleDateString()}{" "}
                  {new Date().toLocaleTimeString()}
                </>
              ) : (
                "Loading..."
              )}
            </span>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>System Activity</h2>
        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>⚡</div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>
                Strategy <strong>MeanReversion_ETH</strong> executed a buy order
              </p>
              <span className={styles.activityTime}>Just now</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>✓</div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>
                Broker <strong>InteractiveBrokers</strong> connection verified
              </p>
              <span className={styles.activityTime}>15 mins ago</span>
            </div>
          </div>
          <div className={styles.activityItem}>
            <div className={styles.activityIcon}>!</div>
            <div className={styles.activityContent}>
              <p className={styles.activityText}>
                New strategy <strong>TrendFollower_BTC</strong> deployed
                successfully
              </p>
              <span className={styles.activityTime}>1 hour ago</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Console Actions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>+</span>
            <span className={styles.actionText}>Deploy Strategy</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>⇅</span>
            <span className={styles.actionText}>Connect Broker</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>📄</span>
            <span className={styles.actionText}>View Logs</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>⚙</span>
            <span className={styles.actionText}>Settings</span>
          </button>
        </div>
      </section>
    </div>
  );
}
