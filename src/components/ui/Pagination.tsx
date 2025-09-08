import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisible?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisible = 5,
  className,
  size = 'md',
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4 text-sm',
  };

  return (
    <nav
      className={cn('flex items-center justify-center space-x-1', className)}
      role="navigation"
      aria-label="Pagination"
    >
      {/* First page */}
      {showFirstLast && currentPage > 2 && (
        <>
          <Button
            variant="outline"
            size={size}
            className={sizeClasses[size]}
            onClick={() => onPageChange(1)}
            aria-label="Go to first page"
          >
            1
          </Button>
          {currentPage > 3 && (
            <span className="px-2 text-slate-500">...</span>
          )}
        </>
      )}

      {/* Previous page */}
      {showPrevNext && (
        <Button
          variant="outline"
          size={size}
          className={sizeClasses[size]}
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Page numbers */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'outline'}
          size={size}
          className={sizeClasses[size]}
          onClick={() => onPageChange(page)}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Button>
      ))}

      {/* Next page */}
      {showPrevNext && (
        <Button
          variant="outline"
          size={size}
          className={sizeClasses[size]}
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Last page */}
      {showFirstLast && currentPage < totalPages - 1 && (
        <>
          {currentPage < totalPages - 2 && (
            <span className="px-2 text-slate-500">...</span>
          )}
          <Button
            variant="outline"
            size={size}
            className={sizeClasses[size]}
            onClick={() => onPageChange(totalPages)}
            aria-label="Go to last page"
          >
            {totalPages}
          </Button>
        </>
      )}
    </nav>
  );
};

interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn('text-sm text-slate-600 dark:text-slate-400', className)}>
      Showing {startItem} to {endItem} of {totalItems} results
    </div>
  );
};

interface PaginationContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const PaginationContainer: React.FC<PaginationContainerProps> = ({
  children,
  className,
}) => (
  <div className={cn('flex items-center justify-between py-4', className)}>
    {children}
  </div>
);
