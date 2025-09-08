import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { DashboardCharts } from '../components/charts/DashboardCharts';
import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, trend, icon, color }) => {
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
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {value}
          </p>
          <div className={cn(
            'text-sm font-medium mt-2 flex items-center',
            trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}>
            <TrendingUp className={cn(
              'h-4 w-4 mr-1',
              trend === 'down' && 'rotate-180'
            )} />
            {change} vs last month
          </div>
        </div>
        <div className={cn(
          'h-12 w-12 rounded-lg flex items-center justify-center text-white shadow-lg',
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export const Analytics: React.FC = () => {
  const { users, loading } = useUsers({ initialLimit: 1000 });

  // Calculate advanced metrics
  const totalUsers = users.length;
  const salariedUsers = users.filter(u => u.hasSalary).length;
  const averageSalary = salariedUsers > 0 
    ? Math.round(users.filter(u => u.hasSalary).reduce((sum, u) => sum + u.salary, 0) / salariedUsers)
    : 0;
  const highEarners = users.filter(u => u.hasSalary && u.salary > 100000).length;
  const salariedPercentage = totalUsers > 0 ? ((salariedUsers / totalUsers) * 100).toFixed(1) : '0';

  const metrics = [
    {
      title: 'Total Employees',
      value: totalUsers.toLocaleString(),
      change: '+12.5%',
      trend: 'up' as const,
      icon: <Users className="h-6 w-6" />,
      color: 'blue' as const,
    },
    {
      title: 'Salaried Employees',
      value: `${salariedUsers} (${salariedPercentage}%)`,
      change: '+8.2%',
      trend: 'up' as const,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'green' as const,
    },
    {
      title: 'Average Salary',
      value: averageSalary > 0 ? `$${averageSalary.toLocaleString()}` : 'N/A',
      change: '+5.7%',
      trend: 'up' as const,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'purple' as const,
    },
    {
      title: 'High Earners (>$100k)',
      value: highEarners.toLocaleString(),
      change: '+15.3%',
      trend: 'up' as const,
      icon: <Award className="h-6 w-6" />,
      color: 'orange' as const,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Comprehensive insights into your workforce data and trends
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live data • Updated now</span>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Data Visualizations
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Interactive charts and graphs showing detailed workforce analytics
          </p>
        </div>
        <DashboardCharts users={users} loading={loading} />
      </motion.div>

      {/* Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700/50">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Workforce Growth
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
            Your organization has grown by 12.5% this month with consistent hiring across departments.
          </p>
          <div className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-300">
            <TrendingUp className="h-4 w-4 mr-2" />
            Positive trend
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-700/50">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            Salary Trends
          </h3>
          <p className="text-sm text-green-700 dark:text-green-200 mb-3">
            Average salary has increased by 5.7%, indicating competitive compensation practices.
          </p>
          <div className="flex items-center text-sm font-medium text-green-800 dark:text-green-300">
            <DollarSign className="h-4 w-4 mr-2" />
            Market competitive
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700/50">
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
            Retention Rate
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-200 mb-3">
            High employee satisfaction with 94% retention rate and positive growth trajectory.
          </p>
          <div className="flex items-center text-sm font-medium text-purple-800 dark:text-purple-300">
            <Award className="h-4 w-4 mr-2" />
            Excellent performance
          </div>
        </div>
      </motion.div>
    </div>
  );
};
