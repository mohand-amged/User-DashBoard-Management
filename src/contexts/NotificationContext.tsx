import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { Users, DollarSign, TrendingUp, Award, CheckCircle, AlertCircle, Info, UserPlus } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: React.ReactNode;
  timestamp: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'New Employee Added',
    message: 'Sarah Johnson has been successfully added to the system.',
    time: '2 minutes ago',
    read: false,
    timestamp: Date.now() - 2 * 60 * 1000,
    icon: <Users className="h-5 w-5" />
  },
  {
    id: '2',
    type: 'info',
    title: 'Salary Review Completed',
    message: 'Annual salary review for Engineering department completed.',
    time: '1 hour ago',
    read: false,
    timestamp: Date.now() - 60 * 60 * 1000,
    icon: <DollarSign className="h-5 w-5" />
  },
  {
    id: '3',
    type: 'success',
    title: 'Performance Milestone',
    message: 'Team productivity increased by 15% this quarter.',
    time: '3 hours ago',
    read: true,
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    icon: <TrendingUp className="h-5 w-5" />
  },
  {
    id: '4',
    type: 'info',
    title: 'New High Achiever',
    message: '3 employees qualified for performance bonuses.',
    time: '1 day ago',
    read: true,
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    icon: <Award className="h-5 w-5" />
  }
];

// Real-time notification templates
const notificationTemplates = [
  {
    type: 'success' as const,
    title: 'System Update',
    message: 'User data has been synchronized successfully.',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    type: 'info' as const,
    title: 'New User Registration',
    message: 'A new user has joined the platform.',
    icon: <UserPlus className="h-5 w-5" />
  },
  {
    type: 'success' as const,
    title: 'Backup Completed',
    message: 'Daily system backup completed successfully.',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    type: 'warning' as const,
    title: 'Maintenance Scheduled',
    message: 'System maintenance is scheduled for tonight.',
    icon: <AlertCircle className="h-5 w-5" />
  },
  {
    type: 'info' as const,
    title: 'Report Generated',
    message: 'Monthly analytics report has been generated.',
    icon: <Info className="h-5 w-5" />
  }
];

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Calculate time ago string
  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    } else if (hours < 24) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }
  };

  // Update time strings periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          time: getTimeAgo(notification.timestamp)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Add random notifications periodically to simulate real-time system
  useEffect(() => {
    const interval = setInterval(() => {
      const template = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...template,
        time: 'Just now',
        read: false,
        timestamp: Date.now()
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only latest 20 notifications
    }, 45000); // Add notification every 45 seconds

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

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

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
