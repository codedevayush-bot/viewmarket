'use client';

import { useTheme } from '@/app/providers/ThemeContext';
import styles from './ThemeSwitcher.module.css';
import type { Theme } from '@/app/providers/ThemeContext';
import { useEffect, useState } from 'react';

// Monochrome SVG icons
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M12.5 8.5A6 6 0 0 1 5.5 1.5a6 6 0 1 0 7 7z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.929 2.929l1.06 1.06M10.01 10.01l1.06 1.061M2.929 11.071l1.06-1.06M10.01 3.99l1.06-1.061"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="1.5"
        y="2"
        width="11"
        height="8"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M4.5 12h5M7 10v2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

const OPTIONS: { id: Theme; label: string; Icon: React.FC }[] = [
  { id: 'dark', label: 'Dark', Icon: MoonIcon },
  { id: 'system', label: 'System', Icon: SystemIcon },
  { id: 'light', label: 'Light', Icon: SunIcon },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  return (
    <div className={styles.switcher} role="group" aria-label="Theme switcher">
      {OPTIONS.map((opt, i) => {
        // During SSR and initial hydration, theme is 'dark' (the default)
        const isActive = mounted ? theme === opt.id : opt.id === 'dark';

        return (
          <div key={opt.id}>
            {i > 0 && <div className={styles.divider} />}
            <button
              className={`${styles.option} ${isActive ? styles.active : ''}`}
              onClick={() => setTheme(opt.id)}
              aria-label={`Switch to ${opt.label} theme`}
              aria-pressed={isActive}
            >
              <span className={styles.optionIcon}>
                <opt.Icon />
              </span>
              <span className={styles.tooltip}>{opt.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
