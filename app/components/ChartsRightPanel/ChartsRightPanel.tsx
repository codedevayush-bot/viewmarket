'use client';

import React from 'react';
import styles from './ChartsRightPanel.module.css';

interface ChartsRightPanelProps {
  onScriptClick?: () => void;
}

export default function ChartsRightPanel({
  onScriptClick,
}: ChartsRightPanelProps) {
  const [isTradeHovered, setIsTradeHovered] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsTradeHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsTradeHovered(false);
    }, 150);
  };

  // Close instantly on any click outside the menu (e.g., clicking the chart)
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsTradeHovered(false);
      }
    };

    if (isTradeHovered) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTradeHovered]);

  return (
    <aside className={styles.panel}>
      <div
        className={styles.toolButton}
        title="Script Editor (Ctrl+B)"
        onClick={onScriptClick}
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
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
      </div>
      <div
        ref={wrapperRef}
        className={styles.toolButtonWrapper}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.toolButton}>
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
            <path d="M3 3v18h18"></path>
            <path d="m19 9-5 5-4-4-3 3"></path>
            <path d="M15 9h4v4"></path>
          </svg>
        </div>

        {isTradeHovered && (
          <div className={styles.tradePopup}>
            <div className={styles.popupHeader}>Trade Execution</div>
            <button className={styles.popupItem}>
              <div className={styles.itemIcon}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>Manual Trade</span>
                  <span className={styles.itemShortcut}>^M</span>
                </div>
                <div className={styles.itemDesc}>
                  Execute instant market orders
                </div>
              </div>
            </button>
            <button className={styles.popupItem}>
              <div className={styles.itemIcon}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <span className={styles.itemTitle}>Automated Trading</span>
                  <span className={styles.itemShortcut}>^A</span>
                </div>
                <div className={styles.itemDesc}>
                  Deploy algorithmic strategies
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      <div className={styles.toolButton} title="AI Analysis">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
          <path d="M5 3v4"></path>
          <path d="M19 17v4"></path>
          <path d="M3 5h4"></path>
          <path d="M17 19h4"></path>
        </svg>
      </div>
      <div className={styles.toolButton} title="Alerts">
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      </div>
      <div className={styles.spacer} />
      <div className={styles.toolButton} title="Help">
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
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
    </aside>
  );
}
