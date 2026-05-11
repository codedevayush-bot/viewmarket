"use client";

import { useState } from "react";
import styles from "../TradingWorkspace.module.css";

type DataTab = "contracts" | "symbols" | "history";

interface ContractRow {
  symbol: string;
  name: string;
  exchange: string;
  segment: string;
  lotSize: number;
  tickSize: number;
}

interface SymbolRow {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface HistoryRow {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

const tabConfig: { id: DataTab; label: string; description: string }[] = [
  { id: "contracts", label: "Contracts", description: "Master contract list" },
  { id: "symbols", label: "Symbols", description: "Symbol search" },
  { id: "history", label: "History", description: "Historical data" },
];

const mockContracts: ContractRow[] = [
  {
    symbol: "NIFTY",
    name: "Nifty 50",
    exchange: "NSE",
    segment: "Futures",
    lotSize: 75,
    tickSize: 0.05,
  },
  {
    symbol: "BANKNIFTY",
    name: "Bank Nifty",
    exchange: "NSE",
    segment: "Futures",
    lotSize: 30,
    tickSize: 0.05,
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    exchange: "NSE",
    segment: "Equity",
    lotSize: 1,
    tickSize: 0.05,
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy",
    exchange: "NSE",
    segment: "Equity",
    lotSize: 1,
    tickSize: 0.05,
  },
  {
    symbol: "NIFTY CE 22400",
    name: "Nifty Call",
    exchange: "NSE",
    segment: "Options",
    lotSize: 75,
    tickSize: 0.05,
  },
  {
    symbol: "NIFTY PE 22400",
    name: "Nifty Put",
    exchange: "NSE",
    segment: "Options",
    lotSize: 75,
    tickSize: 0.05,
  },
];

const mockSymbols: SymbolRow[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    exchange: "NSE",
    type: "Equity",
  },
  {
    symbol: "RELIANCE-EQ",
    name: "Reliance Industries",
    exchange: "NSE",
    type: "Equity",
  },
  {
    symbol: "RELIANCE",
    name: "Reliance Industries",
    exchange: "BSE",
    type: "Equity",
  },
  { symbol: "RNAM", name: "Reliance Nippon AMC", exchange: "NSE", type: "ETF" },
];

const mockHistory: HistoryRow[] = [
  {
    date: "2024-05-10",
    open: "22,450",
    high: "22,580",
    low: "22,320",
    close: "22,485",
    volume: "45.2M",
  },
  {
    date: "2024-05-09",
    open: "22,380",
    high: "22,520",
    low: "22,250",
    close: "22,450",
    volume: "38.7M",
  },
  {
    date: "2024-05-08",
    open: "22,200",
    high: "22,410",
    low: "22,180",
    close: "22,380",
    volume: "42.1M",
  },
  {
    date: "2024-05-07",
    open: "22,150",
    high: "22,300",
    low: "22,050",
    close: "22,200",
    volume: "35.5M",
  },
  {
    date: "2024-05-06",
    open: "22,280",
    high: "22,450",
    low: "22,120",
    close: "22,150",
    volume: "40.3M",
  },
];

export default function DataHubPage() {
  const [activeTab, setActiveTab] = useState<DataTab>("contracts");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContracts = mockContracts.filter(
    (c) =>
      c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredSymbols = mockSymbols.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Data</p>
          <h1 className={styles.title}>Data Hub</h1>
          <p className={styles.subtitle}>
            Access master contracts, search symbols, and retrieve historical
            market data.
          </p>
        </div>
      </header>

      <nav className={styles.tabsNav} aria-label="Data tools">
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

      <div className={styles.searchBar}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={styles.searchIcon}
        >
          <path
            d="M7 12a5 5 0 110-10 5 5 0 010 10zm4-4h1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={`Search ${tabConfig.find((t) => t.id === activeTab)?.label.toLowerCase()}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
              {activeTab === "contracts" &&
                `${filteredContracts.length} instruments`}
              {activeTab === "symbols" && `${filteredSymbols.length} results`}
              {activeTab === "history" && "5 days"}
            </span>
          </div>

          <div className={styles.list}>
            {activeTab === "contracts" && (
              <>
                <div className={styles.dataTableHeader}>
                  <span>Symbol</span>
                  <span>Name</span>
                  <span>Exchange</span>
                  <span>Segment</span>
                  <span>Lot Size</span>
                  <span>Tick Size</span>
                </div>
                {filteredContracts.map((contract, i) => (
                  <div key={i} className={styles.dataTableRow}>
                    <span className={styles.dataCellPrimary}>
                      {contract.symbol}
                    </span>
                    <span>{contract.name}</span>
                    <span className={styles.exchangeBadge}>
                      {contract.exchange}
                    </span>
                    <span className={styles.segmentBadge}>
                      {contract.segment}
                    </span>
                    <span>{contract.lotSize}</span>
                    <span>{contract.tickSize}</span>
                  </div>
                ))}
              </>
            )}

            {activeTab === "symbols" && (
              <>
                <div className={styles.dataTableHeader}>
                  <span>Symbol</span>
                  <span>Name</span>
                  <span>Exchange</span>
                  <span>Type</span>
                </div>
                {filteredSymbols.map((symbol, i) => (
                  <div key={i} className={styles.dataTableRow}>
                    <span className={styles.dataCellPrimary}>
                      {symbol.symbol}
                    </span>
                    <span>{symbol.name}</span>
                    <span className={styles.exchangeBadge}>
                      {symbol.exchange}
                    </span>
                    <span className={styles.typeBadge}>{symbol.type}</span>
                  </div>
                ))}
              </>
            )}

            {activeTab === "history" && (
              <>
                <div className={styles.dataTableHeader}>
                  <span>Date</span>
                  <span>Open</span>
                  <span>High</span>
                  <span>Low</span>
                  <span>Close</span>
                  <span>Volume</span>
                </div>
                {mockHistory.map((row, i) => (
                  <div key={i} className={styles.dataTableRow}>
                    <span className={styles.dataCellPrimary}>{row.date}</span>
                    <span>{row.open}</span>
                    <span className={styles.positiveCell}>{row.high}</span>
                    <span className={styles.negativeCell}>{row.low}</span>
                    <span>{row.close}</span>
                    <span>{row.volume}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className={styles.panelActions}>
            <button className={styles.primaryButton}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14 4v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2zM10 9l3 3-3 3M7 12h6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Export
            </button>
            <button className={styles.primaryButton}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Refresh
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
            <span className={styles.actionLabel}>Import CSV</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Export CSV</span>
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
            <span className={styles.actionLabel}>Bulk Upload</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 20V10M12 20V4M6 20v-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Custom Query</span>
          </button>
        </div>
      </section>
    </div>
  );
}
