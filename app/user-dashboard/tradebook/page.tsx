import type { Metadata } from 'next';
import styles from '../TradingWorkspace.module.css';

const executionMetrics = [
  { label: 'Orders Today', value: '31', detail: '12 open, 19 completed' },
  { label: 'Trade Fills', value: '24', detail: 'Across 7 strategies' },
  { label: 'Fill Ratio', value: '77%', detail: 'Market and limit mix' },
];

const orderbookRows = [
  {
    symbol: 'SBIN',
    type: 'Limit buy',
    status: 'Open · 150 qty',
    value: '622.40',
  },
  {
    symbol: 'NIFTY FUT',
    type: 'Stop loss',
    status: 'Triggered · 25 qty',
    value: '22,418.00',
  },
  {
    symbol: 'ICICIBANK',
    type: 'Market sell',
    status: 'Completed · 80 qty',
    value: '1,168.30',
  },
];

const tradeRows = [
  {
    symbol: 'AXISBANK',
    side: 'Buy fill',
    note: 'VWAP aligned entry · 100 qty',
    value: '1,121.85',
  },
  {
    symbol: 'BANKNIFTY 48000 PE',
    side: 'Sell fill',
    note: 'Hedge unwind · 45 qty',
    value: '214.60',
  },
  {
    symbol: 'TCS',
    side: 'Buy fill',
    note: 'Swing add-on · 30 qty',
    value: '3,982.10',
  },
];

export const metadata: Metadata = {
  title: 'Tradebook',
  description:
    'Unified execution workspace for orderbook and tradebook activity in the ViewMarket dashboard.',
};

export default function TradebookPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Trading</p>
          <h1 className={styles.title}>Tradebook</h1>
          <p className={styles.subtitle}>
            Review active orders and completed fills without splitting execution
            history across multiple sidebar entries.
          </p>
        </div>
      </header>

      <section className={styles.metricsGrid} aria-label="Execution summary">
        {executionMetrics.map((metric) => (
          <article key={metric.label} className={styles.metricCard}>
            <span className={styles.metricLabel}>{metric.label}</span>
            <strong className={styles.metricValue}>{metric.value}</strong>
            <span className={styles.metricDetail}>{metric.detail}</span>
          </article>
        ))}
      </section>

      <section className={styles.workspaceGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Orderbook</p>
              <h2 className={styles.panelTitle}>Live orders</h2>
            </div>
            <span className={styles.badge}>12 open</span>
          </div>
          <div className={styles.list}>
            {orderbookRows.map((row) => (
              <div key={`${row.symbol}-${row.type}`} className={styles.row}>
                <div>
                  <p className={styles.primaryText}>{row.symbol}</p>
                  <p className={styles.secondaryText}>
                    {row.type} · {row.status}
                  </p>
                </div>
                <span className={styles.rowValue}>{row.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Tradebook</p>
              <h2 className={styles.panelTitle}>Recent fills</h2>
            </div>
            <span className={styles.badge}>24 fills</span>
          </div>
          <div className={styles.list}>
            {tradeRows.map((row) => (
              <div key={`${row.symbol}-${row.side}`} className={styles.row}>
                <div>
                  <p className={styles.primaryText}>{row.symbol}</p>
                  <p className={styles.secondaryText}>
                    {row.side} · {row.note}
                  </p>
                </div>
                <span className={styles.rowValue}>{row.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
