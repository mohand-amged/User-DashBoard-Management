import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AdvancedSearch } from '../search/AdvancedSearch';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { cn } from '../../lib/utils';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => setSearchOpen(true),
      description: 'Open search'
    },
    {
      key: 'n',
      ctrlKey: true,
      callback: () => navigate('/users'),
      description: 'Go to users page'
    },
    {
      key: 'd',
      ctrlKey: true,
      callback: () => navigate('/dashboard'),
      description: 'Go to dashboard'
    },
    {
      key: 'a',
      ctrlKey: true,
      callback: () => navigate('/analytics'),
      description: 'Go to analytics'
    }
  ]);

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Advanced Search */}
      <AdvancedSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(result) => {
          console.log('Selected:', result);
          // Handle search result selection
          if (result.type === 'user') {
            navigate('/users');
          } else if (result.type === 'command') {
            if (result.title.includes('Analytics')) {
              navigate('/analytics');
            } else if (result.title.includes('Add')) {
              navigate('/users');
            }
          }
        }}
      />
    </div>
  );
};
