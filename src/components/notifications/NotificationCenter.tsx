import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Users, DollarSign, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: React.ReactNode;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'New Employee Added',
    message: 'Sarah Johnson has been successfully added to the system.',
    time: '2 minutes ago',
    read: false,
    icon: <Users className="h-5 w-5" />
  },
  {
    id: '2',
    type: 'info',
    title: 'Salary Review Completed',
    message: 'Annual salary review for Engineering department completed.',
    time: '1 hour ago',
    read: false,
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    id: '3',
    type: 'success',
    title: 'Performance Milestone',
    message: 'Team productivity increased by 15% this quarter.',
    time: '3 hours ago',
    read: true,
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: '4',
    type: 'info',
    title: 'New High Achiever',
    message: '3 employees qualified for performance bonuses.',
    time: '1 day ago',
    read: true,
    icon: <Award className="h-5 w-5" />
  }
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Simulate real-time notifications
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: 'success',
        title: 'Real-time Update',
        message: 'System data has been synchronized successfully.',
        time: 'Just now',
        read: false,
        icon: <CheckCircle className="h-5 w-5" />
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    }, 30000); // Add notification every 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 border-l border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Bell className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Notifications
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 300 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors',
                        !notification.read && 'bg-blue-50/50 dark:bg-blue-900/10'
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          'flex-shrink-0 p-2 rounded-lg border',
                          getTypeStyles(notification.type)
                        )}>
                          <div className={getIconColor(notification.type)}>
                            {notification.icon}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              !notification.read
                                ? 'text-slate-900 dark:text-slate-100'
                                : 'text-slate-600 dark:text-slate-400'
                            )}>
                              {notification.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="ml-2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="h-3 w-3 text-slate-400" />
                            </button>
                          </div>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                            {notification.time}
                          </p>
                        </div>

                        {!notification.read && (
                          <div className="flex-shrink-0 h-2 w-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No notifications</p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button className="w-full py-2 px-4 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors font-medium">
                View all notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
