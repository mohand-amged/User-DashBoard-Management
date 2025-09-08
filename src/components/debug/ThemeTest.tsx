import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { Sun, Moon } from 'lucide-react';

export const ThemeTest: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
        Theme Test Panel
      </div>
      
      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
        <div>Current Theme: <span className="font-semibold">{theme}</span></div>
        <div>HTML Class: <span className="font-mono">{document.documentElement.className}</span></div>
        <div>Data Theme: <span className="font-mono">{document.documentElement.getAttribute('data-theme')}</span></div>
      </div>
      
      <Button
        onClick={toggleTheme}
        variant="outline"
        size="sm"
        className="mt-3 w-full"
      >
        {theme === 'light' ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
        Switch to {theme === 'light' ? 'Dark' : 'Light'}
      </Button>
      
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded text-center">
          Light BG
        </div>
        <div className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 p-2 rounded text-center">
          Dark BG
        </div>
      </div>
    </div>
  );
};
