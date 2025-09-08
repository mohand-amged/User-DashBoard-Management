import React from 'react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => (
  <div className={cn('flex items-center justify-center', className)}>
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-slate-300 border-t-blue-600',
        sizeClasses[size]
      )}
    />
  </div>
);

interface LoadingDotsProps {
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className }) => (
  <div className={cn('flex space-x-1', className)}>
    <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
    <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
    <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" />
  </div>
);

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => (
  <div className={cn('animate-pulse bg-slate-200 dark:bg-slate-700 rounded', className)} />
);

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  className,
  spinnerSize = 'lg',
  message = 'Loading...',
}) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
        <div className="text-center">
          <LoadingSpinner size={spinnerSize} className="mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-sm">{message}</p>
        </div>
      </div>
    )}
  </div>
);

interface LoadingStateProps {
  loading: boolean;
  error?: string;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  children,
  loadingComponent,
  errorComponent,
}) => {
  if (loading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return errorComponent ? (
      <>{errorComponent}</>
    ) : (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return <>{children}</>;
};

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText = 'Loading...',
  children,
  disabled,
  className,
  ...props
}) => (
  <button
    {...props}
    disabled={disabled || isLoading}
    className={cn(
      'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
      'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
  >
    {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
    {isLoading ? loadingText : children}
  </button>
);
