'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import SymbolSearchModal from '../../components/SymbolSearchModal/SymbolSearchModal';
import styles from '../UserDashboard.module.css';

const DEFAULT_ACTION_KEY = 'vm_default_symbol_action';
const DEFAULT_ACTION_OPTIONS = [
  { label: 'Charts', path: '/user-dashboard/charts' },
  { label: 'Strategy Studio', path: '/user-dashboard/strategy-studio' },
  { label: 'Action Center', path: '/user-dashboard/action-center' },
  { label: 'Tradebook', path: '/user-dashboard/tradebook' },
];

const NOTIFICATIONS: {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'error' | 'info';
}[] = [
  {
    id: 1,
    title: 'Strategy executed',
    message: 'MeanReversion_ETH placed a buy order at $3,245.00',
    time: 'Just now',
    type: 'success',
  },
  {
    id: 2,
    title: 'Broker disconnected',
    message: 'InteractiveBrokers connection lost. Reconnecting...',
    time: '5 mins ago',
    type: 'error',
  },
  {
    id: 3,
    title: 'New signal detected',
    message: 'BTCUSD showing bullish divergence on 4H timeframe',
    time: '1 hour ago',
    type: 'info',
  },
  {
    id: 4,
    title: 'Deployment complete',
    message: 'TrendFollower_BTC strategy deployed successfully',
    time: '3 hours ago',
    type: 'success',
  },
];

const PINNED_SYMBOLS: { symbol: string; price: string; change: string }[] = [
  { symbol: 'BTCUSD', price: '$92,450.00', change: '+2.4%' },
  { symbol: 'ETHUSD', price: '$3,245.00', change: '-0.8%' },
  { symbol: 'SOLUSD', price: '$145.20', change: '+5.1%' },
];

const RECENT_EXECUTIONS: {
  id: string;
  type: 'Buy' | 'Sell';
  symbol: string;
  qty: string;
  price: string;
  status: string;
}[] = [
  {
    id: '1',
    type: 'Buy',
    symbol: 'BTCUSD',
    qty: '0.5',
    price: '$92,450.00',
    status: 'Filled',
  },
  {
    id: '2',
    type: 'Sell',
    symbol: 'ETHUSD',
    qty: '10.0',
    price: '$3,245.00',
    status: 'Filled',
  },
  {
    id: '3',
    type: 'Buy',
    symbol: 'SOLUSD',
    qty: '100.0',
    price: '$145.20',
    status: 'Pending',
  },
];

export default function ConsolePage() {
  const router = useRouter();
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isSymbolSearchOpen, setIsSymbolSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [isSearchSettingsOpen, setIsSearchSettingsOpen] = useState(false);
  const [defaultAction, setDefaultAction] = useState(DEFAULT_ACTION_OPTIONS[0]);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchSettingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem(DEFAULT_ACTION_KEY);
    if (saved) {
      const match = DEFAULT_ACTION_OPTIONS.find((o) => o.label === saved);
      if (match) {
        setDefaultAction(match);
      }
    }
  }, []);

  // Persist default action
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(DEFAULT_ACTION_KEY, defaultAction.label);
    }
  }, [defaultAction, mounted]);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  // Close search settings dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchSettingsRef.current &&
        !searchSettingsRef.current.contains(e.target as Node)
      ) {
        setIsSearchSettingsOpen(false);
      }
    };
    if (isSearchSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchSettingsOpen]);

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const handleSymbolSelect = (symbol: string) => {
    router.push(`${defaultAction.path}?symbol=${symbol}`);
  };

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading Console...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* Top header bar */}
      <header className={styles.topHeader}>
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search symbols..."
            onFocus={() => setIsSymbolSearchOpen(true)}
          />
          <div className={styles.searchSettingsWrapper} ref={searchSettingsRef}>
            <button
              className={`${styles.searchSettingsBtn} ${isSearchSettingsOpen ? styles.isActive : ''}`}
              title="Default action"
              onClick={() => setIsSearchSettingsOpen((prev) => !prev)}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
            {isSearchSettingsOpen && (
              <div className={styles.searchSettingsDropdown}>
                <div className={styles.searchSettingsHeader}>
                  On select, open
                </div>
                <div className={styles.searchSettingsList}>
                  {DEFAULT_ACTION_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      className={`${styles.searchSettingsOption} ${defaultAction.label === opt.label ? styles.searchSettingsOptionActive : ''}`}
                      onClick={() => {
                        setDefaultAction(opt);
                        setIsSearchSettingsOpen(false);
                      }}
                    >
                      <span>{opt.label}</span>
                      {defaultAction.label === opt.label && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {isSymbolSearchOpen && (
          <SymbolSearchModal
            onClose={() => setIsSymbolSearchOpen(false)}
            onSelect={handleSymbolSelect}
          />
        )}
        <div className={styles.topHeaderRight} ref={notifRef}>
          <button
            className={styles.signOutButton}
            title="Cancel All Orders"
            onClick={() => {
              /* Placeholder for kill switch action */
            }}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              borderColor: '#ef4444',
            }}
          >
            Panic / Cancel All
          </button>

          <button
            className={styles.topHeaderIconBtn}
            title="Shortcuts"
            onClick={() => {}}
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
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
            </svg>
          </button>

          <button
            className={`${styles.topHeaderIconBtn} ${isNotificationsOpen ? styles.isActive : ''}`}
            title="Notifications"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>

          {isNotificationsOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                {notifications.length > 0 && (
                  <button
                    className={styles.notifClearBtn}
                    onClick={clearAllNotifications}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className={styles.notifList}>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className={styles.notifItem}>
                      <div className={`${styles.notifDot} ${styles[n.type]}`} />
                      <div className={styles.notifContent}>
                        <div className={styles.notifItemTitle}>{n.title}</div>
                        <div className={styles.notifMessage}>{n.message}</div>
                        <div className={styles.notifTime}>{n.time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.notifEmpty}>No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>2/3</div>
              <div className={styles.statLabel}>Active Brokers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>142</div>
              <div className={styles.statLabel}>Trades (24h)</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>18</div>
              <div className={styles.statLabel}>Streaming Symbols</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>12ms</div>
              <div className={styles.statLabel}>System Latency</div>
            </div>
          </div>
          <div
            style={{
              marginTop: '24px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 350px',
              gap: '24px',
            }}
          >
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Pinned Symbols</h3>
              <div className={styles.activityList}>
                {PINNED_SYMBOLS.map((s) => (
                  <div key={s.symbol} className={styles.activityItem}>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        <strong>{s.symbol}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span className={styles.activityText}>{s.price}</span>
                        <span className={styles.activityTime}>{s.change}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Recent Executions</h3>
              <div className={styles.activityList}>
                {RECENT_EXECUTIONS.map((e) => (
                  <div key={e.id} className={styles.activityItem}>
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        <strong
                          style={{
                            color: e.type === 'Buy' ? '#22c55e' : '#ef4444',
                          }}
                        >
                          {e.type}
                        </strong>{' '}
                        {e.qty} {e.symbol}
                      </p>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <span className={styles.activityText}>{e.price}</span>
                        <span className={styles.activityTime}>{e.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={styles.connectionDetailsWrapper}
              style={{ width: '350px', height: 'fit-content' }}
            >
              <div className={styles.connectionDetailsHeader}>
                <h2 className={styles.connectionDetailsTitle}>Static IP</h2>
                <div className={styles.connectionStatus}>
                  <span
                    className={styles.statusDot}
                    style={{ backgroundColor: '#71717a' }}
                  ></span>
                  Not Connected
                </div>
              </div>

              <div className={styles.connectionDetailsCard}>
                <div
                  className={styles.connectionRow}
                  style={{
                    flexDirection: 'column',
                    gap: '16px',
                    alignItems: 'center',
                    padding: '24px 20px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <h3
                      style={{
                        margin: '0 0 8px 0',
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Need a Static IP?
                    </h3>
                    <p
                      style={{
                        margin: '0',
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4',
                      }}
                    >
                      Ensure consistent, secure connectivity for your automated
                      trading strategies and satisfy broker-specific IP
                      allowlisting requirements.
                    </p>
                  </div>
                  <button
                    className={styles.signOutButton}
                    onClick={() => router.push('/pricing')}
                    style={{ width: '100%', padding: '10px' }}
                  >
                    Buy Static IP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
