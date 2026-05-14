import { Metadata } from 'next';
import styles from '../UserDashboard.module.css';

export const metadata: Metadata = {
  title: 'Strategy Builder',
  description: 'Build and automate your trading strategies.',
};

export default function StrategyBuilderPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Strategy Builder</h1>
        <p className={styles.subtitle}>
          Design and backtest your custom trading logic.
        </p>
      </header>

      <section className={styles.section}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Saved Strategies</p>
          <p className={styles.statNumber}>0</p>
          <p className={styles.subtitle}>
            Drag-and-drop strategy builder coming soon.
          </p>
        </div>
      </section>
    </div>
  );
}
