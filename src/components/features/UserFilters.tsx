import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter,
  X,
  ChevronDown,
  Calendar,
  DollarSign,
  Building2,
  MapPin,
  Briefcase,
  SlidersHorizontal,
  Star
} from 'lucide-react';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import type { User, UserFilters, FilterPreset } from '../../types/user';
import { cn, getActiveFiltersCount, getUniqueValues } from '../../lib/utils';

interface UserFiltersProps {
  filters: Partial<UserFilters>;
  onFiltersChange: (filters: Partial<UserFilters>) => void;
  onResetFilters: () => void;
  users: User[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

// Predefined filter presets
const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'active-admins',
    name: 'Active Admins',
    icon: '👑',
    filters: { role: 'admin', status: 'active' }
  },
  {
    id: 'salaried-users',
    name: 'Salaried Employees',
    icon: '💰',
    filters: { hasSalary: 'yes' }
  },
  {
    id: 'high-earners',
    name: 'High Earners',
    icon: '🎯',
    filters: { hasSalary: 'yes', salaryMin: 100000 }
  },
  {
    id: 'recent-users',
    name: 'Recent Joins',
    icon: '🆕',
    filters: { 
      createdAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  },
  {
    id: 'managers',
    name: 'Management Team',
    icon: '👥',
    filters: { role: 'manager', status: 'active' }
  }
];

export const UserFiltersPanel: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onResetFilters,
  users,
  isVisible,
  onToggleVisibility
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'advanced'>('quick');
  const [showPresets, setShowPresets] = useState(false);

  const activeFiltersCount = useMemo(() => getActiveFiltersCount(filters), [filters]);

  // Get unique values for dropdowns
  const uniqueCompanies = useMemo(() => getUniqueValues(users, 'company.name'), [users]);
  const uniqueJobTitles = useMemo(() => getUniqueValues(users, 'jobTitle'), [users]);
  const uniqueCities = useMemo(() => getUniqueValues(users, 'address.city'), [users]);

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    onFiltersChange({ [key]: value });
  };

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters);
    setShowPresets(false);
  };

  const removeFilter = (key: keyof UserFilters) => {
    const defaultValues: Record<string, any> = {
      search: '',
      role: 'all',
      status: 'all',
      hasSalary: 'all',
      salaryMin: '',
      salaryMax: '',
      company: '',
      jobTitle: '',
      city: '',
      createdAfter: '',
      createdBefore: ''
    };
    onFiltersChange({ [key]: defaultValues[key] });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="sm:hidden"
          >
            <Filter className="h-4 w-4" />
            <span className="ml-2">
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </span>
          </Button>
          
          <h3 className="hidden sm:block text-lg font-medium text-slate-900 dark:text-slate-100">
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                {activeFiltersCount} active
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPresets(!showPresets)}
              className="hidden sm:flex"
            >
              <Star className="h-4 w-4 mr-2" />
              Presets
              <ChevronDown className={cn(
                "h-4 w-4 ml-2 transition-transform",
                showPresets && "rotate-180"
              )} />
            </Button>

            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50"
                >
                  <div className="p-2">
                    {FILTER_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                      >
                        <span className="mr-2 text-lg">{preset.icon}</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {(isVisible || window.innerWidth >= 640) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('quick')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'quick'
                    ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-slate-600 border-transparent hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                )}
              >
                <SlidersHorizontal className="h-4 w-4 inline-block mr-2" />
                Quick Filters
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'advanced'
                    ? 'text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'text-slate-600 border-transparent hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                )}
              >
                <Filter className="h-4 w-4 inline-block mr-2" />
                Advanced
              </button>
            </div>

            <div className="p-4">
              <AnimatePresence mode="wait">
                {activeTab === 'quick' ? (
                  <motion.div
                    key="quick"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    {/* Search */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="lg:col-span-2">
                        <Input
                          placeholder="Search users, emails, companies, job titles..."
                          value={filters.search || ''}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                          icon={<Search />}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Select
                        label="Role"
                        value={filters.role || 'all'}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        options={[
                          { value: 'all', label: 'All Roles' },
                          { value: 'admin', label: 'Admin' },
                          { value: 'manager', label: 'Manager' },
                          { value: 'user', label: 'User' },
                        ]}
                      />

                      <Select
                        label="Status"
                        value={filters.status || 'all'}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        options={[
                          { value: 'all', label: 'All Status' },
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' },
                        ]}
                      />

                      <Select
                        label="Salary Status"
                        value={filters.hasSalary || 'all'}
                        onChange={(e) => handleFilterChange('hasSalary', e.target.value)}
                        options={[
                          { value: 'all', label: 'All Users' },
                          { value: 'yes', label: 'Salaried' },
                          { value: 'no', label: 'Not Salaried' },
                        ]}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="advanced"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Salary Range */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <DollarSign className="h-4 w-4 inline-block mr-2" />
                        Salary Range
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="number"
                          placeholder="Min salary"
                          value={filters.salaryMin || ''}
                          onChange={(e) => handleFilterChange('salaryMin', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Max salary"
                          value={filters.salaryMax || ''}
                          onChange={(e) => handleFilterChange('salaryMax', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Company & Job Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          <Building2 className="h-4 w-4 inline-block mr-2" />
                          Company
                        </label>
                        <Select
                          value={filters.company || ''}
                          onChange={(e) => handleFilterChange('company', e.target.value)}
                          options={[
                            { value: '', label: 'All Companies' },
                            ...uniqueCompanies.map(company => ({
                              value: company,
                              label: company
                            }))
                          ]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          <Briefcase className="h-4 w-4 inline-block mr-2" />
                          Job Title
                        </label>
                        <Select
                          value={filters.jobTitle || ''}
                          onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
                          options={[
                            { value: '', label: 'All Job Titles' },
                            ...uniqueJobTitles.map(jobTitle => ({
                              value: jobTitle,
                              label: jobTitle
                            }))
                          ]}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <MapPin className="h-4 w-4 inline-block mr-2" />
                        City
                      </label>
                      <Select
                        value={filters.city || ''}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                        options={[
                          { value: '', label: 'All Cities' },
                          ...uniqueCities.map(city => ({
                            value: city,
                            label: city
                          }))
                        ]}
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        <Calendar className="h-4 w-4 inline-block mr-2" />
                        Registration Date
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          type="date"
                          placeholder="From date"
                          value={filters.createdAfter || ''}
                          onChange={(e) => handleFilterChange('createdAfter', e.target.value)}
                        />
                        <Input
                          type="date"
                          placeholder="To date"
                          value={filters.createdBefore || ''}
                          onChange={(e) => handleFilterChange('createdBefore', e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700"
                >
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <FilterTag
                        label={`Search: "${filters.search}"`}
                        onRemove={() => removeFilter('search')}
                      />
                    )}
                    {filters.role && filters.role !== 'all' && (
                      <FilterTag
                        label={`Role: ${filters.role}`}
                        onRemove={() => removeFilter('role')}
                      />
                    )}
                    {filters.status && filters.status !== 'all' && (
                      <FilterTag
                        label={`Status: ${filters.status}`}
                        onRemove={() => removeFilter('status')}
                      />
                    )}
                    {filters.hasSalary && filters.hasSalary !== 'all' && (
                      <FilterTag
                        label={`Salaried: ${filters.hasSalary === 'yes' ? 'Yes' : 'No'}`}
                        onRemove={() => removeFilter('hasSalary')}
                      />
                    )}
                    {(filters.salaryMin !== '' && filters.salaryMin !== undefined) && (
                      <FilterTag
                        label={`Min: $${Number(filters.salaryMin).toLocaleString()}`}
                        onRemove={() => removeFilter('salaryMin')}
                      />
                    )}
                    {(filters.salaryMax !== '' && filters.salaryMax !== undefined) && (
                      <FilterTag
                        label={`Max: $${Number(filters.salaryMax).toLocaleString()}`}
                        onRemove={() => removeFilter('salaryMax')}
                      />
                    )}
                    {filters.company && (
                      <FilterTag
                        label={`Company: ${filters.company}`}
                        onRemove={() => removeFilter('company')}
                      />
                    )}
                    {filters.jobTitle && (
                      <FilterTag
                        label={`Job: ${filters.jobTitle}`}
                        onRemove={() => removeFilter('jobTitle')}
                      />
                    )}
                    {filters.city && (
                      <FilterTag
                        label={`City: ${filters.city}`}
                        onRemove={() => removeFilter('city')}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Filter Tag Component
const FilterTag: React.FC<{ label: string; onRemove: () => void }> = ({ label, onRemove }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
  >
    {label}
    <button
      onClick={onRemove}
      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
    >
      <X className="h-3 w-3" />
    </button>
  </motion.span>
);
