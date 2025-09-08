import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, icon, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-100">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-slate-400">
                {icon}
              </div>
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-offset-slate-900 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-500',
              hasError
                ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-400'
                : 'border-slate-300 focus-visible:ring-blue-500 hover:border-slate-400 dark:hover:border-slate-500',
              icon && 'pl-10',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            hasError ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-100">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-offset-slate-900 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-500',
            hasError
              ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-400'
              : 'border-slate-300 focus-visible:ring-blue-500 hover:border-slate-400 dark:hover:border-slate-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            hasError ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };

// Select component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-slate-100">
            {label}
          </label>
        )}
        <select
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
            'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:ring-offset-slate-900 dark:focus-visible:ring-blue-500',
            hasError
              ? 'border-red-500 focus-visible:ring-red-500 dark:border-red-400'
              : 'border-slate-300 focus-visible:ring-blue-500 hover:border-slate-400 dark:hover:border-slate-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
              {option.label}
            </option>
          ))}
        </select>
        {(error || helperText) && (
          <p className={cn(
            'text-sm',
            hasError ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
