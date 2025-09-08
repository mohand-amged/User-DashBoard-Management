import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, Activity, TrendingUp, DollarSign, Download } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { LoadingSkeleton } from '../components/ui/Loading';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>
          {change && (
            <p className={cn(
              'text-sm font-medium',
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              {trend === 'up' ? '+' : ''}{change}
            </p>
          )}
        </div>
        <div className={cn(
          'h-12 w-12 rounded-lg flex items-center justify-center text-white',
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export const Dashboard: React.FC = () => {
  const { users, loading, pagination } = useUsers();
  const [lastUpdated, setLastUpdated] = useState<string>(() => new Date().toLocaleString());
  const navigate = useNavigate();

  // Quick action handlers
  const handleAddUser = () => {
    navigate('/users', { state: { openAddForm: true } });
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  const handleExportData = () => {
    // Export current users data as CSV
    const csvData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle,
      salary: user.hasSalary ? user.salary : 'N/A',
      hasSalary: user.hasSalary ? 'Yes' : 'No',
      role: user.role,
      status: user.status,
      company: user.company.name,
    }));
    
    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Update last updated time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleString());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const totalUsers = pagination.totalItems;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const salariedUsers = users.filter(u => u.hasSalary).length;
  const averageSalary = users.filter(u => u.hasSalary).length > 0 
    ? Math.round(users.filter(u => u.hasSalary).reduce((sum, u) => sum + u.salary, 0) / users.filter(u => u.hasSalary).length)
    : 0;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      change: '+12%',
      trend: 'up' as const,
      icon: <Users className="h-6 w-6" />,
      color: 'blue' as const,
    },
    {
      title: 'Active Users',
      value: activeUsers,
      change: '+5%',
      trend: 'up' as const,
      icon: <Activity className="h-6 w-6" />,
      color: 'green' as const,
    },
    {
      title: 'Salaried Users',
      value: salariedUsers,
      change: `${Math.round((salariedUsers / totalUsers) * 100)}%`,
      trend: 'up' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'purple' as const,
    },
    {
      title: 'Avg. Salary',
      value: averageSalary > 0 ? `$${averageSalary.toLocaleString()}` : 'N/A',
      change: '+3%',
      trend: 'up' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'orange' as const,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Welcome back! Here's what's happening with your users.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: {lastUpdated}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <LoadingSkeleton className="h-4 w-24" />
                  <LoadingSkeleton className="h-8 w-16" />
                  <LoadingSkeleton className="h-4 w-12" />
                </div>
                <LoadingSkeleton className="h-12 w-12 rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))
        )}
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddUser}
              className="w-full flex items-center p-3 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 hover:shadow-md"
            >
              <UserPlus className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  Add New User
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Create a new employee record
                </div>
              </div>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewAnalytics}
              className="w-full flex items-center p-3 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 hover:shadow-md"
            >
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  View Analytics
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Analyze workforce trends
                </div>
              </div>
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportData}
              disabled={users.length === 0}
              className="w-full flex items-center p-3 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  Export Data
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Download user data as CSV
                </div>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Recent Users
          </h2>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <LoadingSkeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <LoadingSkeleton className="h-4 w-32" />
                    <LoadingSkeleton className="h-3 w-24" />
                  </div>
                  <LoadingSkeleton className="h-4 w-16" />
                </div>
              ))
            ) : users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center space-x-3">
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
                <span className={cn(
                  'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                )}>
                  {user.status}
                </span>
              </div>
            ))}
            {!loading && users.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                No users found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
