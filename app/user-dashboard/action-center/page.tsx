import type { Metadata } from 'next';
import styles from '../TradingWorkspace.module.css';

const summaryMetrics = [
  { label: 'Open Positions', value: '08', detail: '3 intraday, 5 carry' },
  { label: 'Holdings', value: '12', detail: 'Across equity and ETF books' },
  { label: 'Day PnL', value: '+2.84%', detail: 'Net of charges and slippage' },
];

const positionRows = [
  {
    symbol: 'NIFTY MAY 22400 CE',
    side: 'Long',
    exposure: '120 qty',
    mark: '+1.42%',
  },
  {
    symbol: 'BANKNIFTY FUT',
    side: 'Short',
    exposure: '25 qty',
    mark: '-0.34%',
  },
  {
    symbol: 'RELIANCE',
    side: 'Long',
    exposure: '160 qty',
    mark: '+0.88%',
  },
];

const holdingsRows = [
  { symbol: 'HDFCBANK', quantity: '45 shares', allocation: '18%' },
  { symbol: 'INFY', quantity: '60 shares', allocation: '12%' },
  { symbol: 'NIFTYBEES', quantity: '220 units', allocation: '26%' },
];

const pnlRows = [
  {
    bucket: 'Intraday',
    value: '+14,820',
    note: 'Best contributor: FinServ basket',
  },
  { bucket: 'Swing', value: '+8,410', note: '3 active strategy sleeves' },
  {
    bucket: 'Charges',
    value: '-1,275',
    note: 'Brokerage, taxes, and exchange fees',
  },
];

export const metadata: Metadata = {
  title: 'Action Center',
  description:
    'Unified monitoring workspace for positions, holdings, and PnL in the ViewMarket dashboard.',
};

export default function ActionCenterPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Trading</p>
          <h1 className={styles.title}>Action Center</h1>
          <p className={styles.subtitle}>
            Monitor portfolio exposure, inventory, and profit performance from
            one compact workspace.
          </p>
        </div>
      </header>

      <section className={styles.metricsGrid} aria-label="Action summary">
        {summaryMetrics.map((metric) => (
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
              <p className={styles.panelEyebrow}>Positions</p>
              <h2 className={styles.panelTitle}>Live exposure</h2>
            </div>
            <span className={styles.badge}>8 open</span>
          </div>
          <div className={styles.list}>
            {positionRows.map((row) => (
              <div key={row.symbol} className={styles.row}>
                <div>
                  <p className={styles.primaryText}>{row.symbol}</p>
                  <p className={styles.secondaryText}>
                    {row.side} · {row.exposure}
                  </p>
                </div>
                <span className={styles.rowValue}>{row.mark}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Holdings</p>
              <h2 className={styles.panelTitle}>Long-term inventory</h2>
            </div>
            <span className={styles.badge}>12 lines</span>
          </div>
          <div className={styles.list}>
            {holdingsRows.map((row) => (
              <div key={row.symbol} className={styles.row}>
                <div>
                  <p className={styles.primaryText}>{row.symbol}</p>
                  <p className={styles.secondaryText}>{row.quantity}</p>
                </div>
                <span className={styles.rowValue}>{row.allocation}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.panelEyebrow}>PnL Tracker</p>
            <h2 className={styles.panelTitle}>Performance buckets</h2>
          </div>
          <span className={styles.badge}>Updated live</span>
        </div>
        <div className={styles.listPanel}>
          {pnlRows.map((row) => (
            <div key={row.bucket} className={styles.row}>
              <div>
                <p className={styles.primaryText}>{row.bucket}</p>
                <p className={styles.secondaryText}>{row.note}</p>
              </div>
              <span className={styles.rowValue}>{row.value}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
