'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './TimeframeDropdown.module.css';

interface TimeframeDropdownProps {
  activeTimeframe: string;
  onSelect: (tf: string) => void;
  onClose: () => void;
}

interface TimeframeSection {
  label: string;
  values: string[];
}

const SECTIONS: TimeframeSection[] = [
  { label: 'Seconds', values: ['1s', '2s', '5s', '15s', '45s'] },
  {
    label: 'Minutes',
    values: ['1m', '2m', '3m', '5m', '10m', '15m', '30m', '45m'],
  },
  { label: 'Hours', values: ['1H', '2H', '3H', '4H'] },
  { label: 'Days', values: ['1D', '2D', '3D'] },
  { label: 'Months', values: ['1M', '3M', '6M', '12M'] },
];

function getDefaultExpanded(activeTimeframe: string): Record<string, boolean> {
  const expanded: Record<string, boolean> = {};
  for (const section of SECTIONS) {
    expanded[section.label] = section.values.includes(activeTimeframe);
  }
  // Always ensure at least Minutes is expanded
  if (!Object.values(expanded).some(Boolean)) {
    expanded['Minutes'] = true;
  }
  return expanded;
}

export default function TimeframeDropdown({
  activeTimeframe,
  onSelect,
  onClose,
}: TimeframeDropdownProps) {
  const [expanded, setExpanded] = useState(() =>
    getDefaultExpanded(activeTimeframe)
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const toggleSection = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      {SECTIONS.map((section) => (
        <div key={section.label} className={styles.section}>
          <button
            className={styles.sectionHeader}
            onClick={() => toggleSection(section.label)}
          >
            <span className={styles.sectionLabel}>{section.label}</span>
            <svg
              className={`${styles.chevron} ${expanded[section.label] ? styles.open : ''}`}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {expanded[section.label] && (
            <div className={styles.sectionValues}>
              {section.values.map((val) => (
                <button
                  key={val}
                  className={`${styles.valueButton} ${activeTimeframe === val ? styles.active : ''}`}
                  onClick={() => {
                    onSelect(val);
                    onClose();
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
