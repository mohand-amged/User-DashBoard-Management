import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ThemeContextType } from '../types';
import { getLocalStorage, setLocalStorage } from '../lib/utils';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Function to apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
    
    // Also set the data attribute for better CSS support
    root.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = getLocalStorage<'light' | 'dark' | null>('theme', null as 'light' | 'dark' | null);
    
    let initialTheme: 'light' | 'dark';
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      initialTheme = savedTheme;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = prefersDark ? 'dark' : 'light';
      // Save the detected preference
      setLocalStorage('theme', initialTheme);
    }
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setLocalStorage('theme', newTheme);
    applyTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
