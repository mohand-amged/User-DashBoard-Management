import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, DollarSign, Briefcase, Command } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { cn } from '../../lib/utils';

interface SearchResult {
  type: 'user' | 'salary' | 'job' | 'command';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  data?: any;
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (result: SearchResult) => void;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { users } = useUsers({ initialLimit: 1000 });

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search functionality
  useEffect(() => {
    if (!query.trim()) {
      setResults([
        {
          type: 'command',
          title: 'Add New User',
          subtitle: 'Create a new employee record',
          icon: <Users className="h-4 w-4" />,
        },
        {
          type: 'command',
          title: 'View Analytics',
          subtitle: 'Open analytics dashboard',
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          type: 'command',
          title: 'Export Data',
          subtitle: 'Download user data as CSV',
          icon: <Briefcase className="h-4 w-4" />,
        },
      ]);
      setSelectedIndex(0);
      return;
    }

    const searchResults: SearchResult[] = [];

    // Search users
    const matchingUsers = users
      .filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.jobTitle.toLowerCase().includes(query.toLowerCase()) ||
        user.company.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);

    matchingUsers.forEach(user => {
      searchResults.push({
        type: 'user',
        title: user.name,
        subtitle: `${user.jobTitle} at ${user.company.name}`,
        icon: <img src={user.avatar} alt={user.name} className="h-4 w-4 rounded-full" />,
        data: user,
      });
    });

    // Search by salary ranges
    if (query.toLowerCase().includes('salary') || query.includes('$')) {
      const avgSalary = Math.round(
        users.filter(u => u.hasSalary)
          .reduce((sum, u) => sum + u.salary, 0) / users.filter(u => u.hasSalary).length
      );
      
      searchResults.push({
        type: 'salary',
        title: 'Average Salary',
        subtitle: `$${avgSalary.toLocaleString()} across all employees`,
        icon: <DollarSign className="h-4 w-4" />,
      });

      const highEarners = users.filter(u => u.hasSalary && u.salary > 100000).length;
      searchResults.push({
        type: 'salary',
        title: 'High Earners',
        subtitle: `${highEarners} employees earning over $100k`,
        icon: <DollarSign className="h-4 w-4" />,
      });
    }

    // Search by job titles
    const uniqueJobTitles = [...new Set(users.map(u => u.jobTitle))];
    const matchingJobs = uniqueJobTitles
      .filter(job => job.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);

    matchingJobs.forEach(job => {
      const count = users.filter(u => u.jobTitle === job).length;
      searchResults.push({
        type: 'job',
        title: job,
        subtitle: `${count} employee${count !== 1 ? 's' : ''} with this role`,
        icon: <Briefcase className="h-4 w-4" />,
      });
    });

    setResults(searchResults.slice(0, 8));
    setSelectedIndex(0);
  }, [query, users]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    onClose();
    setQuery('');
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return 'text-blue-600 dark:text-blue-400';
      case 'salary':
        return 'text-green-600 dark:text-green-400';
      case 'job':
        return 'text-purple-600 dark:text-purple-400';
      case 'command':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users, salaries, jobs, or commands..."
                  className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 outline-none text-lg"
                />
                <div className="flex items-center space-x-1 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <div className="py-2">
                  {results.map((result, index) => (
                    <motion.div
                      key={`${result.type}-${result.title}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors flex items-center space-x-3',
                        index === selectedIndex
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      )}
                      onClick={() => handleSelect(result)}
                    >
                      <div className={cn('flex-shrink-0', getTypeColor(result.type))}>
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {result.title}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {result.subtitle}
                        </p>
                      </div>
                      <div className="text-xs text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded capitalize">
                        {result.type}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Search className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    {query ? 'No results found' : 'Start typing to search...'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded mr-1">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded mr-2">↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded mr-2">Enter</kbd>
                    Select
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded mr-2">Esc</kbd>
                    Close
                  </span>
                </div>
                <span>{results.length} results</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
