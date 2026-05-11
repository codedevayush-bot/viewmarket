"use client";

import { useState } from "react";
import styles from "../TradingWorkspace.module.css";

type OptionsTab =
  | "chain"
  | "greeks"
  | "oi"
  | "volatility"
  | "straddle"
  | "maxpain"
  | "gex";

interface OptionRow {
  strike: string;
  ce: { bid: string; ask: string; iv: string; volume: string };
  spot: string;
  pe: { bid: string; ask: string; iv: string; volume: string };
}

interface GreekRow {
  strike: string;
  type: string;
  delta: string;
  gamma: string;
  theta: string;
  vega: string;
}

interface OIRow {
  strike: string;
  change: string;
  volume: string;
  type: "call" | "put";
}

const tabConfig: { id: OptionsTab; label: string; description: string }[] = [
  { id: "chain", label: "Chain", description: "Option chain with live prices" },
  { id: "greeks", label: "Greeks", description: "Delta, Gamma, Theta, Vega" },
  { id: "oi", label: "OI Analysis", description: "Open Interest tracking" },
  {
    id: "volatility",
    label: "Volatility",
    description: "Vol surface & IV smile",
  },
  { id: "straddle", label: "Straddle", description: "Straddle chart & PnL" },
  {
    id: "maxpain",
    label: "Max Pain",
    description: "Max pain strike calculator",
  },
  { id: "gex", label: "GEX", description: "Gamma exposure dashboard" },
];

const mockOptionChain: OptionRow[] = [
  {
    strike: "22400",
    ce: { bid: "245.5", ask: "248.2", iv: "14.2", volume: "12.5K" },
    spot: "22385",
    pe: { bid: "158.3", ask: "161.0", iv: "13.8", volume: "15.2K" },
  },
  {
    strike: "22450",
    ce: { bid: "201.8", ask: "204.5", iv: "14.5", volume: "8.3K" },
    spot: "22385",
    pe: { bid: "175.2", ask: "178.0", iv: "13.5", volume: "9.1K" },
  },
  {
    strike: "22500",
    ce: { bid: "162.4", ask: "165.0", iv: "14.8", volume: "18.7K" },
    spot: "22385",
    pe: { bid: "195.6", ask: "198.5", iv: "13.2", volume: "14.8K" },
  },
  {
    strike: "22550",
    ce: { bid: "128.5", ask: "131.2", iv: "15.2", volume: "6.2K" },
    spot: "22385",
    pe: { bid: "221.8", ask: "224.5", iv: "12.9", volume: "7.5K" },
  },
  {
    strike: "22600",
    ce: { bid: "98.2", ask: "100.5", iv: "15.6", volume: "22.1K" },
    spot: "22385",
    pe: { bid: "252.4", ask: "255.0", iv: "12.5", volume: "19.3K" },
  },
];

const mockGreeks: GreekRow[] = [
  {
    strike: "22400",
    type: "ITM",
    delta: "0.58",
    gamma: "0.0024",
    theta: "-12.45",
    vega: "8.23",
  },
  {
    strike: "22450",
    type: "ATM",
    delta: "0.52",
    gamma: "0.0028",
    theta: "-14.22",
    vega: "9.15",
  },
  {
    strike: "22500",
    type: "OTM",
    delta: "0.45",
    gamma: "0.0025",
    theta: "-13.88",
    vega: "8.72",
  },
  {
    strike: "22550",
    type: "OTM",
    delta: "0.38",
    gamma: "0.0022",
    theta: "-12.65",
    vega: "7.98",
  },
  {
    strike: "22600",
    type: "Deep OTM",
    delta: "0.28",
    gamma: "0.0018",
    theta: "-11.42",
    vega: "6.85",
  },
];

const mockOI: OIRow[] = [
  { strike: "22200", change: "+15.2K", volume: "45.8K", type: "put" },
  { strike: "22300", change: "+8.5K", volume: "32.1K", type: "put" },
  { strike: "22400", change: "+22.3K", volume: "58.4K", type: "put" },
  { strike: "22500", change: "+18.7K", volume: "41.2K", type: "call" },
  { strike: "22600", change: "+12.4K", volume: "28.9K", type: "call" },
];

const mockVolSurface = [
  { strike: "22200", iv: "16.2", delta: "10" },
  { strike: "22300", iv: "15.8", delta: "25" },
  { strike: "22400", iv: "15.5", delta: "40" },
  { strike: "22500", iv: "15.8", delta: "50" },
  { strike: "22600", iv: "16.5", delta: "60" },
  { strike: "22700", iv: "17.2", delta: "75" },
];

const mockStraddle = [
  { price: "22000", straddle: "285", pnl: "+1250" },
  { price: "22100", straddle: "265", pnl: "+850" },
  { price: "22200", straddle: "245", pnl: "+450" },
  { price: "22300", straddle: "228", pnl: "+0" },
  { price: "22400", straddle: "215", pnl: "-250" },
  { price: "22500", straddle: "235", pnl: "-580" },
];

const maxPainData = {
  strike: "22400",
  ceOI: "45.2K",
  peOI: "52.8K",
  distance: "15 points below spot",
};

const gexData = {
  totalGex: "-12.5B",
  gammaZero: "22450",
  dealerPosition: "Short gamma",
  nextLevel: "22350",
};

export default function OptionsLabPage() {
  const [activeTab, setActiveTab] = useState<OptionsTab>("chain");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Market Tools</p>
          <h1 className={styles.title}>Options Lab</h1>
          <p className={styles.subtitle}>
            Analyze options chain, Greeks, volatility, and OI data in one
            unified workspace.
          </p>
        </div>
      </header>

      <nav className={styles.tabsNav} aria-label="Options tools">
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
              {activeTab === "chain" && "NIFTY"}
              {activeTab === "greeks" && "NIFTY"}
              {activeTab === "oi" && "Live"}
              {activeTab === "volatility" && "3D View"}
              {activeTab === "straddle" && "1D Chart"}
              {activeTab === "maxpain" && "Expiry: MAY"}
              {activeTab === "gex" && "Real-time"}
            </span>
          </div>

          <div className={styles.list}>
            {activeTab === "chain" && (
              <>
                <div className={styles.tableHeader}>
                  <span>Strike</span>
                  <span>CE Bid</span>
                  <span>CE Ask</span>
                  <span>IV</span>
                  <span>Spot</span>
                  <span>PE Bid</span>
                  <span>PE Ask</span>
                  <span>IV</span>
                </div>
                {mockOptionChain.map((row) => (
                  <div key={row.strike} className={styles.tableRow}>
                    <span className={styles.tableCellPrimary}>
                      {row.strike}
                    </span>
                    <span>{row.ce.bid}</span>
                    <span>{row.ce.ask}</span>
                    <span className={styles.ivCell}>{row.ce.iv}%</span>
                    <span className={styles.spotCell}>{row.spot}</span>
                    <span>{row.pe.bid}</span>
                    <span>{row.pe.ask}</span>
                    <span className={styles.ivCell}>{row.pe.iv}%</span>
                  </div>
                ))}
              </>
            )}

            {activeTab === "greeks" && (
              <>
                <div className={styles.tableHeader}>
                  <span>Strike</span>
                  <span>Type</span>
                  <span>Delta</span>
                  <span>Gamma</span>
                  <span>Theta</span>
                  <span>Vega</span>
                </div>
                {mockGreeks.map((row) => (
                  <div key={row.strike} className={styles.tableRow}>
                    <span className={styles.tableCellPrimary}>
                      {row.strike}
                    </span>
                    <span
                      className={`${styles.typeBadge} ${
                        row.type === "ATM"
                          ? styles.typeAtm
                          : row.type === "ITM"
                            ? styles.typeitm
                            : styles.typeOtm
                      }`}
                    >
                      {row.type}
                    </span>
                    <span>{row.delta}</span>
                    <span>{row.gamma}</span>
                    <span className={styles.thetaCell}>{row.theta}</span>
                    <span>{row.vega}</span>
                  </div>
                ))}
              </>
            )}

            {activeTab === "oi" && (
              <>
                <div className={styles.tableHeader}>
                  <span>Strike</span>
                  <span>Change</span>
                  <span>Volume</span>
                  <span>Bias</span>
                </div>
                {mockOI.map((row, i) => (
                  <div key={i} className={styles.tableRow}>
                    <span className={styles.tableCellPrimary}>
                      {row.strike}
                    </span>
                    <span
                      className={
                        row.change.startsWith("+")
                          ? styles.positiveCell
                          : styles.negativeCell
                      }
                    >
                      {row.change}
                    </span>
                    <span>{row.volume}</span>
                    <span
                      className={`${styles.oiBadge} ${
                        row.type === "call" ? styles.oiCall : styles.oiPut
                      }`}
                    >
                      {row.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </>
            )}

            {activeTab === "volatility" && (
              <>
                <div className={styles.tableHeader}>
                  <span>Strike</span>
                  <span>IV</span>
                  <span>Delta %</span>
                  <span>Vol Curve</span>
                </div>
                {mockVolSurface.map((row, i) => (
                  <div key={i} className={styles.tableRow}>
                    <span className={styles.tableCellPrimary}>
                      {row.strike}
                    </span>
                    <span className={styles.ivCell}>{row.iv}%</span>
                    <span>{row.delta}%</span>
                    <div className={styles.volBar}>
                      <div
                        className={styles.volBarFill}
                        style={{ width: `${(parseFloat(row.iv) / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === "straddle" && (
              <>
                <div className={styles.tableHeader}>
                  <span>Spot Price</span>
                  <span>Straddle Premium</span>
                  <span>PnL</span>
                </div>
                {mockStraddle.map((row, i) => (
                  <div key={i} className={styles.tableRow}>
                    <span className={styles.tableCellPrimary}>{row.price}</span>
                    <span>{row.straddle}</span>
                    <span
                      className={
                        row.pnl.startsWith("+")
                          ? styles.positiveCell
                          : styles.negativeCell
                      }
                    >
                      {row.pnl}
                    </span>
                  </div>
                ))}
              </>
            )}

            {activeTab === "maxpain" && (
              <div className={styles.centeredContent}>
                <div className={styles.maxPainCard}>
                  <p className={styles.maxPainLabel}>Max Pain Strike</p>
                  <p className={styles.maxPainValue}>{maxPainData.strike}</p>
                  <p className={styles.maxPainSub}>
                    {maxPainData.ceOI} CE OI | {maxPainData.peOI} PE OI
                  </p>
                  <p className={styles.maxPainNote}>
                    {maxPainData.distance} from current spot
                  </p>
                </div>
              </div>
            )}

            {activeTab === "gex" && (
              <div className={styles.centeredContent}>
                <div className={styles.gexCard}>
                  <p className={styles.gexLabel}>Total GEX</p>
                  <p className={styles.gexValue}>{gexData.totalGex}</p>
                  <p className={styles.gexSub}>
                    Gamma Zero: {gexData.gammaZero}
                  </p>
                  <div className={styles.gexStatus}>
                    <span className={styles.gexBadge}>
                      {gexData.dealerPosition}
                    </span>
                  </div>
                  <p className={styles.gexNote}>
                    Next support level: {gexData.nextLevel}
                  </p>
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
              Add to Watchlist
            </button>
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
              Export Data
            </button>
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.panelEyebrow}>Quick Analysis</p>
            <h2 className={styles.panelTitle}>Common tools</h2>
          </div>
        </div>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3h18v18H3zM3 9h18M9 21V9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Chain Builder</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Compare Expiry</span>
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
            <span className={styles.actionLabel}>Position Builder</span>
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
            <span className={styles.actionLabel}>PnL Calculator</span>
          </button>
        </div>
      </section>
    </div>
  );
}
