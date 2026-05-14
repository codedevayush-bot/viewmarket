'use client';

import { createContext, useContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface ThemeContextValue {
  /** The stored preference: 'dark' | 'light' | 'system' */
  theme: Theme;
  /** The actual applied theme after resolving 'system' against OS preference */
  resolvedTheme: ResolvedTheme;
  /** Update the stored preference */
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
