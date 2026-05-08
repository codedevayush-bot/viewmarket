"use client";

import React, { useState } from "react";
import styles from "./ChartsHeader.module.css";
import ChartTypeDropdown, {
  ChartTypeIcon,
} from "../ChartTypeDropdown/ChartTypeDropdown";
import TimeframeDropdown from "../TimeframeDropdown/TimeframeDropdown";
import type { ChartType } from "../ChartTypeDropdown/ChartTypeDropdown";

interface ChartsHeaderProps {
  title?: string;
  onSymbolClick?: () => void;
  onStrategyClick?: () => void;
  onSettingsClick?: () => void;
  onRedirectClick?: () => void;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

export default function ChartsHeader({
  title = "",
  onSymbolClick,
  onStrategyClick,
  onSettingsClick,
  onRedirectClick,
  chartType,
  onChartTypeChange,
  timeframe,
  onTimeframeChange,
}: ChartsHeaderProps) {
  const [showChartType, setShowChartType] = useState(false);
  const [showTimeframe, setShowTimeframe] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {title && <h1 className={styles.title}>{title}</h1>}

        <div className={styles.toolbar}>
          <button
            className={styles.symbolButton}
            title="Search Symbol (Ctrl+K)"
            onClick={onSymbolClick}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span className={styles.symbolText}>BTCUSD</span>
          </button>

          <div className={styles.divider} />

          {/* Timeframe Button */}
          <div className={styles.dropdownAnchor}>
            <button
              className={`${styles.toolbarButton} ${showTimeframe ? styles.buttonActive : ""}`}
              title="Timeframe"
              onClick={() => {
                setShowTimeframe((p) => !p);
                setShowChartType(false);
              }}
            >
              <span>{timeframe}</span>
            </button>
            {showTimeframe && (
              <TimeframeDropdown
                activeTimeframe={timeframe}
                onSelect={onTimeframeChange}
                onClose={() => setShowTimeframe(false)}
              />
            )}
          </div>

          <div className={styles.divider} />

          {/* Chart Type Button */}
          <div className={styles.dropdownAnchor}>
            <button
              className={`${styles.toolbarButton} ${showChartType ? styles.buttonActive : ""}`}
              title="Chart Type"
              onClick={() => {
                setShowChartType((p) => !p);
                setShowTimeframe(false);
              }}
            >
              <ChartTypeIcon type={chartType} size={20} />
            </button>
            {showChartType && (
              <ChartTypeDropdown
                activeType={chartType}
                onSelect={onChartTypeChange}
                onClose={() => setShowChartType(false)}
              />
            )}
          </div>

          <div className={styles.divider} />

          <button
            className={styles.toolbarButton}
            title="Strategies (Ctrl+J)"
            onClick={onStrategyClick}
          >
            <span>Strategy</span>
          </button>
        </div>
      </div>
      <div className={styles.right}>
        <button
          className={styles.redirectButton}
          title="Pop out chart"
          onClick={onRedirectClick}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
        <button
          className={styles.settingsButton}
          title="Chart settings"
          onClick={onSettingsClick}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
}
