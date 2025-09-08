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

  useEffect(() => {
    // Check for saved theme preference or default to 'light' mode
    const savedTheme = getLocalStorage<'light' | 'dark'>('theme', 'light');
    setTheme(savedTheme);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setLocalStorage('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
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
