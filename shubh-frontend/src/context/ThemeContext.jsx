/**
 * ThemeContext.jsx — Dark / Light mode with full persistence
 *
 * Themes: 'dark' (default Dark Academia) | 'light' (warm parchment)
 *
 * Mechanism:
 *  - Adds/removes class 'light' on <html> element
 *  - Tailwind darkMode: 'class' reads this
 *  - CSS custom properties in globals.css override colours for light mode
 *  - Persisted to localStorage key 'shubh-theme'
 *  - Respects system preference on first visit via matchMedia
 */

import {
  createContext, useContext, useState,
  useEffect, useCallback, useMemo,
} from 'react';

const STORAGE_KEY = 'shubh-theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {}
    // Respect system preference on first visit
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((t) => {
    if (t === 'dark' || t === 'light') setThemeState(t);
  }, []);

  const value = useMemo(() => ({
    theme,
    isDark:  theme === 'dark',
    isLight: theme === 'light',
    toggle,
    setTheme,
  }), [theme, toggle, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside <ThemeProvider>');
  return ctx;
}
