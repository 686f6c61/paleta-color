/**
 * Paleta Color - Color Palette Generator
 * https://github.com/686f6c61/paleta-color
 *
 * Theme Context
 * December 2025
 *
 * Manages dark/light theme state for the entire application.
 * Implements theme persistence via localStorage and applies
 * the 'dark' class to the document element for Tailwind CSS.
 *
 * Features:
 * - Toggle between light and dark themes
 * - Persistent theme preference via localStorage
 * - System preference detection on first load
 * - Smooth transitions between themes
 *
 * Usage:
 * const { theme, toggleTheme } = useTheme();
 *
 * @context ThemeContext
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
