import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Toast as ToastType } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/50 dark:text-green-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/50 dark:text-red-200',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
};

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export const ToastItem: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const Icon = toastIcons[toast.type];

  const handleClose = () => {
    removeToast(toast.id);
  };

  return (
    <div className={cn(
      'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
      toastStyles[toast.type]
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', iconStyles[toast.type])} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              className="inline-flex rounded-md hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
