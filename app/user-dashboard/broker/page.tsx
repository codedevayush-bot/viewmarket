'use client';

import { useState, useEffect } from 'react';
import styles from './Broker.module.css';
import BrokerModal from './BrokerModal';
import Link from 'next/link';

interface Broker {
  id: string;
  name: string;
  display_name: string;
  auth_type: string;
  form_schema: string | unknown;
}

interface Connection {
  id: string;
  brokerId: string;
  brokerName: string;
  displayName: string;
  accountId: string;
  isValid: boolean;
  authType: string;
  hasApiKey: boolean;
  hasApiSecret: boolean;
  hasAccessToken: boolean;
}

const BROKER_CATEGORIES: Record<string, string> = {
  // Indian
  zerodha: 'Indian',
  upstox: 'Indian',
  angelone: 'Indian',
  fyers: 'Indian',
  dhan: 'Indian',
  dhan_sandbox: 'Indian',
  aliceblue: 'Indian',
  kotakneo: 'Indian',
  shoonya: 'Indian',
  paytm: 'Indian',
  fivepaisa: 'Indian',
  fivepaisaxts: 'Indian',
  groww: 'Indian',
  iifl: 'Indian',
  iiflcapital: 'Indian',
  samco: 'Indian',
  motilal: 'Indian',
  mstock: 'Indian',
  pocketful: 'Indian',
  tradejini: 'Indian',
  wisdom: 'Indian',
  zebu: 'Indian',
  flattrade: 'Indian',
  firstock: 'Indian',
  rmoney: 'Indian',
  definedge: 'Indian',
  jainamxts: 'Indian',
  compositedge: 'Indian',
  indmoney: 'Indian',
  nubra: 'Indian',
  // Crypto
  binance: 'Crypto',
  deltaexchange: 'Crypto',
  // Forex
  ibkr: 'Forex',
};

export default function BrokerPage() {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null);

  const fetchBrokers = async () => {
    setLoading(true);
    try {
      const [brokerRes, connRes] = await Promise.all([
        fetch('/api/brokers'),
        fetch('/api/user/brokers'),
      ]);

      if (brokerRes.ok) {
        const data = await brokerRes.json();
        setBrokers(data.brokers || []);
      }

      if (connRes.ok) {
        const data = await connRes.json();
        setConnections(data.connections || []);
      }
    } catch (err) {
      console.error('Failed to fetch brokers data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBrokers();
  }, []);

  const handleConnectSuccess = () => {
    setSelectedBroker(null);
    fetchBrokers(); // Refresh connections
  };

  const filteredBrokers = brokers
    .filter((b) => {
      const matchesSearch = (b.display_name || b.name)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const category = BROKER_CATEGORIES[b.name.toLowerCase()] || 'Other';

      if (filter === 'All') return matchesSearch;
      if (filter === 'Connected') {
        return matchesSearch && connections.some((c) => c.brokerId === b.id);
      }
      return matchesSearch && category === filter;
    })
    .sort((a, b) =>
      (a.display_name || a.name).localeCompare(b.display_name || b.name)
    );

  return (
    <div className={styles.container}>
      <div className={styles.stickyHeader}>
        <header className={styles.header}>
          <h1 className={styles.title}>Brokers</h1>
          <p className={styles.subtitle}>
            Connect and manage your broker infrastructure securely.
          </p>
        </header>

        <div className={styles.controlBar}>
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
              placeholder="Search brokers..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterSwitch}>
            {['All', 'Indian', 'Forex', 'Crypto', 'Connected'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`${styles.filterTab} ${filter === t ? styles.active : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.scrollContent}>
        {loading ? (
          <div
            style={{
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              padding: '80px',
              fontSize: '0.875rem',
              letterSpacing: '-0.01em',
            }}
          >
            Fetching broker registry...
          </div>
        ) : (
          <div className={styles.listContainer}>
            <div className={styles.brokerList}>
              {filteredBrokers.map((broker) => {
                const connection = connections.find(
                  (c) => c.brokerId === broker.id
                );

                return (
                  <div key={broker.id} className={styles.brokerRow}>
                    <div className={styles.leftSection}>
                      <div className={styles.logoBox}>
                        {(broker.display_name || broker.name)[0]}
                      </div>
                      <div className={styles.brokerMeta}>
                        <span className={styles.brokerName}>
                          {broker.display_name || broker.name}
                        </span>
                        <span className={styles.brokerCategory}>
                          {BROKER_CATEGORIES[broker.name.toLowerCase()] ||
                            'Broker'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.rightSection}>
                      {connection ? (
                        <>
                          <span
                            className={`${styles.connectedBadge} ${!connection.isValid ? styles.invalidBadge : ''}`}
                          >
                            {connection.isValid ? 'Connected' : 'Expired'}
                          </span>
                          {connection.authType === 'OAUTH' &&
                            (!connection.hasAccessToken ||
                              !connection.isValid) && (
                              <Link
                                href={`/api/brokers/oauth?connectionId=${connection.id}`}
                                className={styles.connectBtn}
                                style={{
                                  background: 'var(--text-primary)',
                                  color: 'var(--bg-page)',
                                  textDecoration: 'none',
                                  padding: '6px 12px',
                                  fontSize: '0.75rem',
                                }}
                              >
                                Login
                              </Link>
                            )}
                          {connection.authType === 'API_KEY' &&
                            (!connection.hasAccessToken ||
                              !connection.isValid) && (
                              <button
                                className={styles.connectBtn}
                                style={{
                                  background: 'var(--text-primary)',
                                  color: 'var(--bg-page)',
                                  padding: '6px 12px',
                                  fontSize: '0.75rem',
                                }}
                                onClick={() => {
                                  // TODO: Replace prompt/alert with custom modal component
                                  const token = window.prompt(
                                    'Please enter the generated Request Token / TOTP:'
                                  );
                                  if (token) {
                                    fetch('/api/user/brokers/token-exchange', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        connectionId: connection.id,
                                        requestToken: token,
                                      }),
                                    }).then((res) => {
                                      if (res.ok) {
                                        window.alert(
                                          'Successfully authenticated!'
                                        );
                                        fetchBrokers();
                                      } else {
                                        window.alert('Authentication failed.');
                                      }
                                    });
                                  }
                                }}
                              >
                                Auth Token
                              </button>
                            )}
                          <button
                            className={styles.iconButton}
                            title="Settings"
                            onClick={() => setSelectedBroker(broker)}
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
                        </>
                      ) : (
                        <button
                          className={styles.connectBtn}
                          onClick={() => setSelectedBroker(broker)}
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredBrokers.length === 0 && (
                <div
                  style={{
                    padding: '80px',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: '0.875rem',
                  }}
                >
                  No brokers found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedBroker && (
        <BrokerModal
          broker={selectedBroker}
          onClose={() => setSelectedBroker(null)}
          onSuccess={handleConnectSuccess}
        />
      )}
    </div>
  );
}
