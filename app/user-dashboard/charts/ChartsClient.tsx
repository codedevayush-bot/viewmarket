'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ChartsHeader from '../../components/ChartsHeader/ChartsHeader';
import ChartsFooter from '../../components/ChartsFooter/ChartsFooter';
import ChartsRightPanel from '../../components/ChartsRightPanel/ChartsRightPanel';
import type { ChartType } from '../../components/ChartTypeDropdown/ChartTypeDropdown';
import styles from './ChartsPage.module.css';

const SymbolSearchModal = dynamic(
  () => import('../../components/SymbolSearchModal/SymbolSearchModal'),
  { ssr: false }
);
const StrategyModal = dynamic(
  () => import('../../components/StrategyModal/StrategyModal'),
  { ssr: false }
);
const SettingsModal = dynamic(
  () => import('../../components/SettingsModal/SettingsModal'),
  { ssr: false }
);

// Dynamic import with SSR disabled for Lightweight Charts compatibility
const TradingViewChart = dynamic(
  () => import('../../components/TradingViewChart/TradingViewChart'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.chartArea}>
        <div
          style={{
            height: '100%',
            width: '100%',
            background: 'var(--bg-page)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-faint)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Initializing Charts...
        </div>
      </div>
    ),
  }
);

export default function ChartsClient() {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isStrategyOpen, setIsStrategyOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [chartType, setChartType] = React.useState<ChartType>('candlestick');
  const [timeframe, setTimeframe] = React.useState('1m');

  React.useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') {
          e.preventDefault();
          setIsSearchOpen((prev) => !prev);
          setIsStrategyOpen(false);
          setIsSettingsOpen(false);
        } else if (e.key === 'j') {
          e.preventDefault();
          setIsStrategyOpen((prev) => !prev);
          setIsSearchOpen(false);
          setIsSettingsOpen(false);
        } else if (e.key === ',') {
          e.preventDefault();
          setIsSettingsOpen((prev) => !prev);
          setIsSearchOpen(false);
          setIsStrategyOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  return (
    <div className={styles.chartsPage}>
      <ChartsHeader
        onSymbolClick={() => {
          setIsSearchOpen(true);
          setIsStrategyOpen(false);
          setIsSettingsOpen(false);
        }}
        onStrategyClick={() => {
          setIsStrategyOpen(true);
          setIsSearchOpen(false);
          setIsSettingsOpen(false);
        }}
        onSettingsClick={() => {
          setIsSettingsOpen(true);
          setIsSearchOpen(false);
          setIsStrategyOpen(false);
        }}
        onRedirectClick={() => {
          window.open('/user-dashboard/charts?popout=true', '_blank');
        }}
        chartType={chartType}
        onChartTypeChange={setChartType}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
      />
      <div className={styles.mainContent}>
        <div className={styles.chartArea}>
          <TradingViewChart chartType={chartType} />
        </div>
        <ChartsRightPanel />
      </div>
      <ChartsFooter />

      {isSearchOpen && (
        <SymbolSearchModal onClose={() => setIsSearchOpen(false)} />
      )}

      {isStrategyOpen && (
        <StrategyModal onClose={() => setIsStrategyOpen(false)} />
      )}

      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
}
