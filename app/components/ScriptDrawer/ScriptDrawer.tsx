'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './ScriptDrawer.module.css';
import type { LanguageId } from './editorExtensions';

const CodeEditor = dynamic(() => import('./CodeEditor'), { ssr: false });

interface ScriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRun?: (code: string) => void;
}

const MIN_WIDTH = 300;
const MAX_WIDTH_PERCENT = 80;

const DEFAULT_CODE: Record<LanguageId, string> = {
  javascript: `// Write your trading strategy here
function onTick(candle) {
  // Example: simple moving average crossover
  const sma20 = sma(candles, 20);
  const sma50 = sma(candles, 50);

  if (sma20 > sma50) {
    buy({ symbol: candle.symbol });
  } else if (sma20 < sma50) {
    sell({ symbol: candle.symbol });
  }
}
`,
  typescript: `// Write your trading strategy here
interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
}

function onTick(candle: Candle): void {
  const sma20: number = sma(candles, 20);
  const sma50: number = sma(candles, 50);

  if (sma20 > sma50) {
    buy({ symbol: candle.symbol });
  } else if (sma20 < sma50) {
    sell({ symbol: candle.symbol });
  }
}
`,
  python: `# Write your trading strategy here
def on_tick(candle):
    """Execute strategy logic on each candle."""
    sma_20 = sma(candles, 20)
    sma_50 = sma(candles, 50)

    if sma_20 > sma_50:
        buy(symbol=candle.symbol)
    elif sma_20 < sma_50:
        sell(symbol=candle.symbol)
`,
};

export default function ScriptDrawer({
  isOpen,
  onClose,
  onRun,
}: ScriptDrawerProps) {
  const [width, setWidth] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [language, setLanguage] = useState<LanguageId>('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  const handleLanguageChange = useCallback(
    (lang: LanguageId) => {
      setLanguage(lang);
      // Switch to default template if code matches another language's default
      const isDefault = Object.values(DEFAULT_CODE).some((tpl) => tpl === code);
      if (isDefault) {
        setCode(DEFAULT_CODE[lang]);
      }
    },
    [code]
  );

  const handleRun = useCallback(() => {
    onRun?.(code);
  }, [code, onRun]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleRun, handleClose]);

  // Resize via drag
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth =
        width ?? drawerRef.current?.getBoundingClientRect().width ?? 0;
      const parentWidth =
        drawerRef.current?.parentElement?.getBoundingClientRect().width ?? 1;
      const maxWidth = parentWidth * (MAX_WIDTH_PERCENT / 100);

      const handleMouseMove = (e: MouseEvent) => {
        const delta = startX - e.clientX;
        const newWidth = Math.min(
          Math.max(startWidth + delta, MIN_WIDTH),
          maxWidth
        );
        setWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [width]
  );

  if (!isOpen && !isClosing) return null;

  const drawerStyle: React.CSSProperties = width !== null ? { width } : {};

  return (
    <div
      ref={drawerRef}
      className={`${styles.drawer} ${isClosing ? styles.drawerClosing : ''}`}
      style={drawerStyle}
    >
      <div
        className={`${styles.resizeHandle} ${isResizing ? styles.resizeHandleActive : ''}`}
        onMouseDown={handleResizeStart}
      />
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Script Editor</span>
          <span className={styles.shortcutHint}>Ctrl+B</span>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.runButton}
            onClick={handleRun}
            title="Run Script (Ctrl+Enter)"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <span className={styles.runLabel}>Run</span>
            <span className={styles.shortcutHint}>Ctrl+Enter</span>
          </button>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            title="Close (Esc)"
          >
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.body}>
        <CodeEditor
          value={code}
          onChange={setCode}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
      </div>
    </div>
  );
}
