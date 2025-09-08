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
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the new theme class
    root.classList.add(newTheme);
    
    // Set data attribute for CSS support
    root.setAttribute('data-theme', newTheme);
    
    console.log(`✅ Theme applied: ${newTheme}`, {
      classList: Array.from(root.classList),
      dataTheme: root.getAttribute('data-theme')
    });
  };

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = getLocalStorage<'light' | 'dark'>('theme', 'light');
    
    let initialTheme: 'light' | 'dark' = 'light';
    
    if (savedTheme === 'dark' || savedTheme === 'light') {
      initialTheme = savedTheme;
    } else {
      // Check system preference as fallback
      try {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        initialTheme = prefersDark ? 'dark' : 'light';
      } catch (e) {
        console.log('System theme detection failed, using light theme');
        initialTheme = 'light';
      }
    }
    
    console.log('🎨 Initializing theme:', initialTheme);
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    console.log('🔄 Theme toggle triggered. Current:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🔄 Switching to:', newTheme);
    
    // Update state first
    setTheme(newTheme);
    
    // Save to localStorage
    setLocalStorage('theme', newTheme);
    
    // Apply to DOM
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
