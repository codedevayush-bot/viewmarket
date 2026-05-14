'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  onClose: () => void;
}

const SETTINGS_TABS = [
  'General',
  'Appearance',
  'Indicators',
  'Trading',
  'Shortcuts',
];

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('General');
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Escape handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // Drag handlers
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      const modal = (e.currentTarget as HTMLElement).closest(
        `.${styles.modal}`
      ) as HTMLElement;
      if (!modal) return;
      const rect = modal.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (!position) setPosition({ x: rect.left, y: rect.top });
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const modalStyle: React.CSSProperties = position
    ? {
        position: 'fixed',
        left: position.x,
        top: position.y,
        transform: 'none',
      }
    : {};

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Drag Handle */}
        <div
          className={`${styles.dragHandle} ${isDragging ? styles.dragging : ''}`}
          onMouseDown={handleDragStart}
        >
          <div className={styles.headerLeft}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.headerIcon}
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <h2 className={styles.heading}>Chart Settings</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Sidebar & Content Layout */}
        <div className={styles.container}>
          <aside className={styles.sidebar}>
            {SETTINGS_TABS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </aside>
          <main className={styles.content}>
            <div className={styles.placeholder}>
              <h3 className={styles.tabTitle}>{activeTab} Settings</h3>
              <p className={styles.tabDescription}>
                Configure your {activeTab.toLowerCase()} preferences here.
              </p>
              <div className={styles.mockOptions}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.mockOption}>
                    <div className={styles.optionLabel}>Option {i}</div>
                    <div className={styles.optionControl} />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.resetButton}>Reset Default</button>
          <div className={styles.footerActions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button className={styles.saveButton} onClick={onClose}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
