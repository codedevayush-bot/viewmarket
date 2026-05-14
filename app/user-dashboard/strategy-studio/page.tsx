'use client';

import { useState } from 'react';
import styles from '../TradingWorkspace.module.css';

type StrategyTab = 'visual' | 'webhook' | 'chartink' | 'python' | 'flow';

interface Strategy {
  id: string;
  name: string;
  type: StrategyTab;
  status: 'active' | 'paused' | 'draft';
  lastRun: string;
  description: string;
}

const strategyTabs: { id: StrategyTab; label: string }[] = [
  { id: 'visual', label: 'Visual' },
  { id: 'webhook', label: 'Webhook' },
  { id: 'chartink', label: 'Chartink' },
  { id: 'python', label: 'Python' },
  { id: 'flow', label: 'Flow Builder' },
];

const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'RSI Mean Reversion',
    type: 'visual',
    status: 'active',
    lastRun: '2 mins ago',
    description: 'Buy when RSI < 30, sell when RSI > 70',
  },
  {
    id: '2',
    name: 'Trend Follower',
    type: 'visual',
    status: 'paused',
    lastRun: '1 hour ago',
    description: 'EMA crossover with volume confirmation',
  },
  {
    id: '3',
    name: 'Alert Bot',
    type: 'webhook',
    status: 'draft',
    lastRun: 'Never',
    description: 'Trigger trades from external signals',
  },
  {
    id: '4',
    name: 'Breakout Scanner',
    type: 'python',
    status: 'active',
    lastRun: '5 mins ago',
    description: 'Detect price breakouts with custom logic',
  },
];

export default function StrategyStudioPage() {
  const [activeTab, setActiveTab] = useState<StrategyTab>('visual');

  const filteredStrategies = mockStrategies.filter((s) => s.type === activeTab);

  const getStatusBadgeClass = (status: Strategy['status']) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'paused':
        return styles.statusPaused;
      case 'draft':
        return styles.statusDraft;
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Automation</p>
          <h1 className={styles.title}>Strategy Studio</h1>
          <p className={styles.subtitle}>
            Build, manage, and automate your trading strategies in one unified
            workspace.
          </p>
        </div>
      </header>

      <nav className={styles.tabsNav} aria-label="Strategy types">
        {strategyTabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.tabButtonActive : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={activeTab === tab.id ? 'page' : undefined}
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
                {strategyTabs.find((t) => t.id === activeTab)?.label} Strategies
              </p>
              <h2 className={styles.panelTitle}>
                {activeTab === 'visual' && 'Visual Strategy Builder'}
                {activeTab === 'webhook' && 'Webhook Triggers'}
                {activeTab === 'chartink' && 'Chartink Integration'}
                {activeTab === 'python' && 'Python Scripts'}
                {activeTab === 'flow' && 'Flow Automation'}
              </h2>
            </div>
            <span className={styles.badge}>
              {filteredStrategies.length} strategies
            </span>
          </div>

          {filteredStrategies.length > 0 ? (
            <div className={styles.list}>
              {filteredStrategies.map((strategy) => (
                <div key={strategy.id} className={styles.row}>
                  <div className={styles.rowMain}>
                    <p className={styles.primaryText}>{strategy.name}</p>
                    <p className={styles.secondaryText}>
                      {strategy.description}
                    </p>
                  </div>
                  <div className={styles.rowMeta}>
                    <span
                      className={`${styles.statusBadge} ${getStatusBadgeClass(strategy.status)}`}
                    >
                      {strategy.status}
                    </span>
                    <span className={styles.rowTime}>
                      Last run: {strategy.lastRun}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                No {activeTab} strategies yet
              </p>
              <p className={styles.emptyStateSubtext}>
                Create your first {activeTab} strategy to get started
              </p>
            </div>
          )}

          <div className={styles.panelActions}>
            <button className={styles.primaryButton}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              New {strategyTabs.find((t) => t.id === activeTab)?.label} Strategy
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
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Import Strategy</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Export Strategy</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Templates</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className={styles.actionLabel}>Backtest</span>
          </button>
        </div>
      </section>
    </div>
  );
}
