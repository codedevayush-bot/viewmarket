"use client";

import { useState } from "react";
import styles from "../TradingWorkspace.module.css";

type MonitorTab = "overview" | "logs" | "performance" | "security";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  source: string;
  message: string;
}

interface MetricData {
  name: string;
  value: string;
  change: string;
  status: "up" | "down" | "stable";
}

const tabConfig: { id: MonitorTab; label: string; description: string }[] = [
  { id: "overview", label: "Overview", description: "System health summary" },
  { id: "logs", label: "Logs", description: "Application logs" },
  { id: "performance", label: "Performance", description: "Traffic & latency" },
  { id: "security", label: "Security", description: "Security events" },
];

const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "14:32:15",
    level: "info",
    source: "API",
    message: "Request processed successfully",
  },
  {
    id: "2",
    timestamp: "14:32:14",
    level: "warn",
    source: "Auth",
    message: "Rate limit approaching threshold",
  },
  {
    id: "3",
    timestamp: "14:32:12",
    level: "error",
    source: "Data",
    message: "Failed to fetch market data",
  },
  {
    id: "4",
    timestamp: "14:32:10",
    level: "info",
    source: "Trade",
    message: "Order executed: NIFTY BUY 75",
  },
  {
    id: "5",
    timestamp: "14:32:08",
    level: "debug",
    source: "WS",
    message: "WebSocket message received",
  },
  {
    id: "6",
    timestamp: "14:32:05",
    level: "info",
    source: "API",
    message: "User session refreshed",
  },
  {
    id: "7",
    timestamp: "14:32:03",
    level: "warn",
    source: "Broker",
    message: "High latency detected",
  },
  {
    id: "8",
    timestamp: "14:32:01",
    level: "info",
    source: "Data",
    message: "Market data sync complete",
  },
];

const mockMetrics: MetricData[] = [
  { name: "Requests/min", value: "1,245", change: "+12%", status: "up" },
  { name: "Avg Latency", value: "45ms", change: "-8%", status: "down" },
  { name: "Error Rate", value: "0.02%", change: "-5%", status: "down" },
  { name: "Active Users", value: "128", change: "+3", status: "up" },
];

const mockTraffic = [
  { time: "14:00", requests: "980", latency: "52ms" },
  { time: "14:05", requests: "1,120", latency: "48ms" },
  { time: "14:10", requests: "1,350", latency: "45ms" },
  { time: "14:15", requests: "1,180", latency: "42ms" },
  { time: "14:20", requests: "1,420", latency: "44ms" },
  { time: "14:25", requests: "1,380", latency: "40ms" },
];

export default function ObservabilityHubPage() {
  const [activeTab, setActiveTab] = useState<MonitorTab>("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const getLogLevelClass = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return styles.logInfo;
      case "warn":
        return styles.logWarn;
      case "error":
        return styles.logError;
      case "debug":
        return styles.logDebug;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Operations</p>
          <h1 className={styles.title}>Observability Hub</h1>
          <p className={styles.subtitle}>
            Monitor system health, track logs, analyze performance, and watch
            security events.
          </p>
        </div>
        <div className={styles.headerActions}>
          <label className={styles.autoRefreshToggle}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            Live
          </span>
        </div>
      </header>

      <nav className={styles.tabsNav} aria-label="Monitoring tools">
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

      <section className={styles.metricsGrid}>
        {mockMetrics.map((metric) => (
          <div key={metric.name} className={styles.metricCard}>
            <span className={styles.metricLabel}>{metric.name}</span>
            <strong className={styles.metricValue}>{metric.value}</strong>
            <span
              className={`${styles.metricChange} ${
                metric.status === "up" ? styles.changeUp : styles.changeDown
              }`}
            >
              {metric.change}
            </span>
          </div>
        ))}
      </section>

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
            <div className={styles.panelActionsInline}>
              <select className={styles.filterSelect}>
                <option>All Levels</option>
                <option>Info</option>
                <option>Warning</option>
                <option>Error</option>
              </select>
              <button className={styles.iconActionButton}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 4v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2zM10 9l3 3-3 3M7 12h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.list}>
            {activeTab === "overview" && (
              <div className={styles.healthGrid}>
                <div className={styles.healthItem}>
                  <span className={styles.healthIcon}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 18a8 8 0 100-16 8 8 0 000 16z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 14v-4M10 8h.01"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className={styles.healthLabel}>API Server</span>
                  <span
                    className={`${styles.healthStatus} ${styles.statusHealthy}`}
                  >
                    Healthy
                  </span>
                </div>
                <div className={styles.healthItem}>
                  <span className={styles.healthIcon}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M4 4h12v12H4z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M4 9h12M9 4v12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </span>
                  <span className={styles.healthLabel}>Database</span>
                  <span
                    className={`${styles.healthStatus} ${styles.statusHealthy}`}
                  >
                    Healthy
                  </span>
                </div>
                <div className={styles.healthItem}>
                  <span className={styles.healthIcon}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M17 17H3M5 5l10 10M15 5L5 15"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className={styles.healthLabel}>WebSocket</span>
                  <span
                    className={`${styles.healthStatus} ${styles.statusWarning}`}
                  >
                    High Latency
                  </span>
                </div>
                <div className={styles.healthItem}>
                  <span className={styles.healthIcon}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle
                        cx="10"
                        cy="10"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M10 6v4l3 2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className={styles.healthLabel}>Broker Connection</span>
                  <span
                    className={`${styles.healthStatus} ${styles.statusHealthy}`}
                  >
                    Connected
                  </span>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <>
                <div className={styles.logHeader}>
                  <span>Time</span>
                  <span>Level</span>
                  <span>Source</span>
                  <span>Message</span>
                </div>
                {mockLogs.map((log) => (
                  <div key={log.id} className={styles.logRow}>
                    <span className={styles.logTime}>{log.timestamp}</span>
                    <span
                      className={`${styles.logLevelBadge} ${getLogLevelClass(log.level)}`}
                    >
                      {log.level}
                    </span>
                    <span className={styles.logSource}>{log.source}</span>
                    <span className={styles.logMessage}>{log.message}</span>
                  </div>
                ))}
              </>
            )}

            {activeTab === "performance" && (
              <>
                <div className={styles.trafficHeader}>
                  <span>Time</span>
                  <span>Requests</span>
                  <span>Latency</span>
                </div>
                {mockTraffic.map((row, i) => (
                  <div key={i} className={styles.trafficRow}>
                    <span className={styles.trafficTime}>{row.time}</span>
                    <span className={styles.trafficRequests}>
                      {row.requests}
                    </span>
                    <span className={styles.trafficLatency}>{row.latency}</span>
                  </div>
                ))}
                <div className={styles.chartPlaceholder}>
                  <span>Traffic Chart</span>
                  <div className={styles.chartBars}>
                    {[65, 75, 90, 80, 95, 85].map((h, i) => (
                      <div
                        key={i}
                        className={styles.chartBar}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "security" && (
              <div className={styles.securityEvents}>
                <div className={styles.securityEvent}>
                  <span className={styles.securityIcon}>🔐</span>
                  <div className={styles.securityInfo}>
                    <p className={styles.securityTitle}>Failed Login Attempt</p>
                    <p className={styles.securityMeta}>
                      User: admin@viewmarket.com | IP: 192.168.1.x
                    </p>
                    <p className={styles.securityTime}>2 mins ago</p>
                  </div>
                  <span
                    className={`${styles.securityBadge} ${styles.badgeWarning}`}
                  >
                    Review
                  </span>
                </div>
                <div className={styles.securityEvent}>
                  <span className={styles.securityIcon}>🛡️</span>
                  <div className={styles.securityInfo}>
                    <p className={styles.securityTitle}>API Key Rotated</p>
                    <p className={styles.securityMeta}>
                      Key: vm_live_****f8a2 rotated successfully
                    </p>
                    <p className={styles.securityTime}>15 mins ago</p>
                  </div>
                  <span
                    className={`${styles.securityBadge} ${styles.badgeSuccess}`}
                  >
                    Completed
                  </span>
                </div>
                <div className={styles.securityEvent}>
                  <span className={styles.securityIcon}>⚠️</span>
                  <div className={styles.securityInfo}>
                    <p className={styles.securityTitle}>Unusual API Usage</p>
                    <p className={styles.securityMeta}>
                      Rate limit exceeded for broker: ZERODHA
                    </p>
                    <p className={styles.securityTime}>32 mins ago</p>
                  </div>
                  <span
                    className={`${styles.securityBadge} ${styles.badgeDanger}`}
                  >
                    Action Required
                  </span>
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
              Export {tabConfig.find((t) => t.id === activeTab)?.label}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
