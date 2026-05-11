"use client";

import { useState } from "react";
import styles from "../TradingWorkspace.module.css";

type IntegrationsTab = "overview" | "tradingview" | "gocharting" | "telegram";

interface ConnectedPlatform {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  icon: string;
}

const tabConfig: { id: IntegrationsTab; label: string; description: string }[] =
  [
    {
      id: "overview",
      label: "Overview",
      description: "All connected platforms",
    },
    {
      id: "tradingview",
      label: "TradingView",
      description: "Webhook & alert setup",
    },
    {
      id: "gocharting",
      label: "GoCharting",
      description: "Chart signals integration",
    },
    {
      id: "telegram",
      label: "Telegram Bot",
      description: "Notifications & commands",
    },
  ];

const connectedPlatforms: ConnectedPlatform[] = [
  {
    id: "1",
    name: "TradingView",
    status: "connected",
    lastSync: "2 mins ago",
    icon: "TV",
  },
  {
    id: "2",
    name: "GoCharting",
    status: "connected",
    lastSync: "5 mins ago",
    icon: "GC",
  },
  {
    id: "3",
    name: "Telegram Bot",
    status: "connected",
    lastSync: "1 min ago",
    icon: "TG",
  },
  {
    id: "4",
    name: "Zerodha",
    status: "connected",
    lastSync: "Live",
    icon: "ZD",
  },
];

export default function IntegrationsHubPage() {
  const [activeTab, setActiveTab] = useState<IntegrationsTab>("overview");

  const getStatusBadge = (status: ConnectedPlatform["status"]) => {
    switch (status) {
      case "connected":
        return styles.statusActive;
      case "disconnected":
        return styles.statusDraft;
      case "error":
        return styles.statusPaused;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Connection</p>
          <h1 className={styles.title}>Integrations Hub</h1>
          <p className={styles.subtitle}>
            Manage all your external integrations, webhooks, and notification
            bots from one place.
          </p>
        </div>
      </header>

      <nav className={styles.tabsNav} aria-label="Integration types">
        {tabConfig.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.tabButtonActive : ""
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={styles.workspaceGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>
                {tabConfig.find((t) => t.id === activeTab)?.label}
              </p>
              <h2 className={styles.panelTitle}>
                {tabConfig.find((t) => t.id === activeTab)?.description}
              </h2>
            </div>
            <span className={styles.badge}>
              {activeTab === "overview" &&
                `${connectedPlatforms.length} connected`}
              {activeTab === "tradingview" && "Webhook"}
              {activeTab === "gocharting" && "Signals"}
              {activeTab === "telegram" && "Bot Active"}
            </span>
          </div>

          <div className={styles.list}>
            {activeTab === "overview" && (
              <>
                {connectedPlatforms.map((platform) => (
                  <div key={platform.id} className={styles.integrationRow}>
                    <div className={styles.integrationIcon}>
                      <span>{platform.icon}</span>
                    </div>
                    <div className={styles.integrationInfo}>
                      <p className={styles.primaryText}>{platform.name}</p>
                      <p className={styles.secondaryText}>
                        Last sync: {platform.lastSync}
                      </p>
                    </div>
                    <div className={styles.rowMeta}>
                      <span
                        className={`${styles.statusBadge} ${getStatusBadge(platform.status)}`}
                      >
                        {platform.status}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === "tradingview" && (
              <div className={styles.integrationSetup}>
                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Webhook URL</h3>
                  <div className={styles.webhookUrlBox}>
                    <code className={styles.webhookUrl}>
                      https://api.viewmarket.com/webhook/tradingview/v1
                    </code>
                    <button className={styles.copyButton}>Copy</button>
                  </div>
                </div>

                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Alert Message Format</h3>
                  <div className={styles.codeBlock}>
                    <pre>{`{
  "action": "BUY",
  "symbol": "NIFTY",
  "quantity": 75,
  "price": 22450,
  "strategy": "RSI-Mean-Rev"
}`}</pre>
                  </div>
                </div>

                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Test Connection</h3>
                  <div className={styles.testConnection}>
                    <button className={styles.testButton}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M1 8a7 7 0 1114 0A7 7 0 011 8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M8 5v3l2 2"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>Send Test Alert</span>
                    </button>
                    <span className={styles.testStatus}>
                      Last test: Success
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "gocharting" && (
              <div className={styles.integrationSetup}>
                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Webhook URL</h3>
                  <div className={styles.webhookUrlBox}>
                    <code className={styles.webhookUrl}>
                      https://api.viewmarket.com/webhook/gocharting/v1
                    </code>
                    <button className={styles.copyButton}>Copy</button>
                  </div>
                </div>

                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Signal Types Supported</h3>
                  <div className={styles.signalList}>
                    <span className={styles.signalTag}>Chart Patterns</span>
                    <span className={styles.signalTag}>Indicators</span>
                    <span className={styles.signalTag}>Price Alerts</span>
                  </div>
                </div>

                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Filter Settings</h3>
                  <div className={styles.filterGrid}>
                    <label className={styles.filterItem}>
                      <input type="checkbox" defaultChecked />
                      <span>Auto-execute trades</span>
                    </label>
                    <label className={styles.filterItem}>
                      <input type="checkbox" defaultChecked />
                      <span>Send notifications</span>
                    </label>
                    <label className={styles.filterItem}>
                      <input type="checkbox" />
                      <span>Require confirmation</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "telegram" && (
              <div className={styles.integrationSetup}>
                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Bot Token</h3>
                  <div className={styles.inputGroup}>
                    <input
                      type="password"
                      className={styles.inputField}
                      placeholder="Enter your Telegram bot token"
                      defaultValue="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890"
                    />
                    <button className={styles.saveButton}>Save</button>
                  </div>
                </div>

                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Bot Commands</h3>
                  <div className={styles.commandList}>
                    <div className={styles.commandItem}>
                      <code>/status</code>
                      <span>Get current positions</span>
                    </div>
                    <div className={styles.commandItem}>
                      <code>/pnl</code>
                      <span>View today&apos;s P&amp;L</span>
                    </div>
                    <div className={styles.commandItem}>
                      <code>/orders</code>
                      <span>List active orders</span>
                    </div>
                    <div className={styles.commandItem}>
                      <code>/place [symbol] [qty]</code>
                      <span>Place new order</span>
                    </div>
                  </div>
                </div>

                <div className={styles.setupSection}>
                  <h3 className={styles.setupTitle}>Notifications</h3>
                  <div className={styles.filterGrid}>
                    <label className={styles.filterItem}>
                      <input type="checkbox" defaultChecked />
                      <span>Trade executions</span>
                    </label>
                    <label className={styles.filterItem}>
                      <input type="checkbox" defaultChecked />
                      <span>Order fills</span>
                    </label>
                    <label className={styles.filterItem}>
                      <input type="checkbox" defaultChecked />
                      <span>P&L alerts</span>
                    </label>
                    <label className={styles.filterItem}>
                      <input type="checkbox" />
                      <span>System errors</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.panelActions}>
            <button className={styles.primaryButton}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Add Integration
            </button>
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.panelEyebrow}>Quick Actions</p>
            <h2 className={styles.panelTitle}>Common tasks</h2>
          </div>
        </div>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v4M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Test Webhooks</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h16v16H4zM4 12h16M12 4v16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>View Logs</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>API Keys</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M8.578 16.359l5.578-5.578-5.578-5.578M3 10.781h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Documentation</span>
          </button>
        </div>
      </section>
    </div>
  );
}
