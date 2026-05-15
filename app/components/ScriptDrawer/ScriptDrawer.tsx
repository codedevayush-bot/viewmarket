'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './ScriptDrawer.module.css';

interface ScriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRun?: () => void;
}

const MIN_WIDTH = 300;
const MAX_WIDTH_PERCENT = 80;

export default function ScriptDrawer({
  isOpen,
  onClose,
  onRun,
}: ScriptDrawerProps) {
  const [width, setWidth] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

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
        onRun?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onRun, handleClose]);

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
            onClick={onRun}
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
      <div className={styles.body} />
    </div>
  );
}
