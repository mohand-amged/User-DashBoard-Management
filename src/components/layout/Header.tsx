import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { NotificationCenter } from '../notifications/NotificationCenter';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6">
      <div className="flex items-center justify-between h-16">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Dashboard
            </h1>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotifications(true)}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white animate-pulse">
              2
            </span>
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2 p-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <img
                className="h-8 w-8 rounded-full"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3b82f6&color=fff`}
                alt={user?.name || 'User'}
              />
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role}
                </div>
              </div>
            </Button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {user?.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </div>
                  </div>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </button>
                  
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </button>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </header>
  );
};
