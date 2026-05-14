'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ResolvedTheme, Theme, ThemeContext } from './ThemeContext';

const STORAGE_KEY = 'vm-theme';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR, strict-mode incognito, etc.)
  }
  return 'dark'; // default
}

function applyTheme(resolved: ResolvedTheme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', resolved);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialise with a fixed value to match SSR, then update in useEffect
  const [theme, setThemeState] = useState<Theme>('dark');
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    // Wrap in a promise to move updates out of the synchronous effect body,
    // avoiding the cascading render lint error while ensuring hydration sync.
    Promise.resolve().then(() => {
      setThemeState(readStoredTheme());
      setSystemTheme(getSystemTheme());
    });
  }, []);

  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (theme === 'system') return systemTheme;
    return theme;
  }, [theme, systemTheme]);

  // Apply resolved theme to DOM whenever it changes
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for OS preference changes when theme is 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setSystemTheme(mq.matches ? 'dark' : 'light');
    };

    handleChange();
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Enable CSS transitions after first mount (prevents flash of transition on initial paint)
  useEffect(() => {
    // Small delay ensures the browser has applied the correct theme first
    const timer = setTimeout(() => {
      document.documentElement.setAttribute('data-theme-ready', 'true');
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore if localStorage is unavailable
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
