"use client";

import { useState } from "react";
import styles from "../TradingWorkspace.module.css";

type SandboxTab = "sandbox" | "analyzer" | "playground" | "websocket";

interface TestResult {
  id: string;
  name: string;
  status: "passed" | "failed" | "pending";
  duration: string;
  timestamp: string;
}

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

const tabConfig: { id: SandboxTab; label: string; description: string }[] = [
  { id: "sandbox", label: "Sandbox", description: "Safe testing environment" },
  {
    id: "analyzer",
    label: "Analyzer",
    description: "Backtest & strategy analysis",
  },
  { id: "playground", label: "Playground", description: "Interactive testing" },
  { id: "websocket", label: "WebSocket", description: "WebSocket testing" },
];

const mockTests: TestResult[] = [
  {
    id: "1",
    name: "Order Placement",
    status: "passed",
    duration: "245ms",
    timestamp: "2 mins ago",
  },
  {
    id: "2",
    name: "Position Update",
    status: "passed",
    duration: "189ms",
    timestamp: "5 mins ago",
  },
  {
    id: "3",
    name: "WebSocket Connection",
    status: "passed",
    duration: "52ms",
    timestamp: "8 mins ago",
  },
  {
    id: "4",
    name: "API Authentication",
    status: "failed",
    duration: "1200ms",
    timestamp: "12 mins ago",
  },
  {
    id: "5",
    name: "Data Fetch",
    status: "pending",
    duration: "-",
    timestamp: "Pending",
  },
];

const mockLogs: LogEntry[] = [
  {
    timestamp: "14:32:15",
    level: "info",
    message: "Sandbox environment initialized",
  },
  {
    timestamp: "14:32:16",
    level: "success",
    message: "Connected to test broker",
  },
  { timestamp: "14:32:18", level: "info", message: "Loading test data..." },
  {
    timestamp: "14:32:20",
    level: "warn",
    message: "Rate limit approaching threshold",
  },
  {
    timestamp: "14:32:22",
    level: "info",
    message: "Test scenario loaded successfully",
  },
];

export default function SandboxLabPage() {
  const [activeTab, setActiveTab] = useState<SandboxTab>("sandbox");

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return "✓";
      case "failed":
        return "✗";
      case "pending":
        return "○";
    }
  };

  const getStatusClass = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return styles.statusActive;
      case "failed":
        return styles.statusPaused;
      case "pending":
        return styles.statusDraft;
    }
  };

  const getLogClass = (level: LogEntry["level"]) => {
    switch (level) {
      case "info":
        return styles.logInfo;
      case "warn":
        return styles.logWarn;
      case "error":
        return styles.logError;
      case "success":
        return styles.logSuccess;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Developer</p>
          <h1 className={styles.title}>Sandbox Lab</h1>
          <p className={styles.subtitle}>
            Test strategies, analyze backtests, and debug WebSocket connections
            in a safe environment.
          </p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.envBadge}>Sandbox Mode</span>
        </div>
      </header>

      <nav className={styles.tabsNav} aria-label="Sandbox tools">
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
              {activeTab === "sandbox" && "Active"}
              {activeTab === "analyzer" && "5 tests"}
              {activeTab === "playground" && "Ready"}
              {activeTab === "websocket" && "Connected"}
            </span>
          </div>

          <div className={styles.list}>
            {activeTab === "sandbox" && (
              <>
                <div className={styles.sandboxHeader}>
                  <div className={styles.sandboxStatus}>
                    <span className={styles.statusDot} />
                    <span>Environment Ready</span>
                  </div>
                  <button className={styles.primaryButton}>
                    Reset Environment
                  </button>
                </div>
                <div className={styles.sandboxConfig}>
                  <div className={styles.configItem}>
                    <label>Broker</label>
                    <select className={styles.selectField}>
                      <option>Test Broker (Paper)</option>
                      <option>Simulated</option>
                    </select>
                  </div>
                  <div className={styles.configItem}>
                    <label>Initial Capital</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      defaultValue="10,00,000"
                    />
                  </div>
                  <div className={styles.configItem}>
                    <label>Date Range</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      defaultValue="Last 30 days"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "analyzer" && (
              <>
                <div className={styles.testListHeader}>
                  <span>Test Name</span>
                  <span>Status</span>
                  <span>Duration</span>
                  <span>Last Run</span>
                </div>
                {mockTests.map((test) => (
                  <div key={test.id} className={styles.testRow}>
                    <span className={styles.testName}>{test.name}</span>
                    <span
                      className={`${styles.testStatus} ${getStatusClass(test.status)}`}
                    >
                      <span className={styles.statusIcon}>
                        {getStatusIcon(test.status)}
                      </span>
                      {test.status}
                    </span>
                    <span>{test.duration}</span>
                    <span className={styles.timestamp}>{test.timestamp}</span>
                  </div>
                ))}
              </>
            )}

            {activeTab === "playground" && (
              <div className={styles.playgroundArea}>
                <div className={styles.codeEditor}>
                  <div className={styles.codeEditorHeader}>
                    <span>JavaScript</span>
                    <button className={styles.runButton}>Run</button>
                  </div>
                  <div className={styles.codeContent}>
                    <pre>{`// Test your strategy logic here
const signal = checkMA(close, 20, 50);
if (signal === 'BUY') {
  placeOrder('NIFTY', 'BUY', 75);
}`}</pre>
                  </div>
                </div>
                <div className={styles.outputPanel}>
                  <h3>Output</h3>
                  <pre
                    className={styles.outputContent}
                  >{`> Strategy loaded successfully
> Running backtest...
> Completed in 2.4s
> Total trades: 45 | Win rate: 62%`}</pre>
                </div>
              </div>
            )}

            {activeTab === "websocket" && (
              <div className={styles.wsSetup}>
                <div className={styles.wsConfig}>
                  <div className={styles.configItem}>
                    <label>WebSocket URL</label>
                    <input
                      type="text"
                      className={styles.inputField}
                      defaultValue="wss://test.viewmarket.com/ws"
                    />
                  </div>
                  <button className={styles.connectButton}>Connect</button>
                </div>
                <div className={styles.wsLog}>
                  <div className={styles.wsLogHeader}>
                    <span>Messages</span>
                    <span className={styles.connectionStatus}>
                      <span className={styles.statusDotConnected} />
                      Connected
                    </span>
                  </div>
                  <div className={styles.wsMessages}>
                    {mockLogs.map((log, i) => (
                      <div
                        key={i}
                        className={`${styles.wsMessage} ${getLogClass(log.level)}`}
                      >
                        <span className={styles.wsTimestamp}>
                          {log.timestamp}
                        </span>
                        <span className={styles.wsLevel}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className={styles.wsMessageText}>
                          {log.message}
                        </span>
                      </div>
                    ))}
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
              New {tabConfig.find((t) => t.id === activeTab)?.label} Test
            </button>
            {activeTab === "analyzer" && (
              <button className={styles.secondaryButton}>Run All Tests</button>
            )}
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.panelEyebrow}>Quick Actions</p>
            <h2 className={styles.panelTitle}>Common tools</h2>
          </div>
        </div>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Import Script</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 17H7A5 5 0 017 7h2M15 7h2a5 5 0 010 10h-2M8 12h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Export Results</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h16v16H4zM9 9h6v6H9z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Templates</span>
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
