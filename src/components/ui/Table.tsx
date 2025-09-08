import React from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-slate-100/50 font-medium [&>tr]:last:border-b-0 dark:bg-slate-800/50',
      className
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-slate-100/50 data-[state=selected]:bg-slate-100 dark:hover:bg-slate-800/50 dark:data-[state=selected]:bg-slate-800',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortable, sortDirection, onSort, children, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-slate-500 [&:has([role=checkbox])]:pr-0 dark:text-slate-400',
        sortable && 'cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center space-x-2">
        <span>{children}</span>
        {sortable && (
          <div className="ml-2 flex-shrink-0">
            {sortDirection === 'asc' && <ChevronUp className="h-4 w-4" />}
            {sortDirection === 'desc' && <ChevronDown className="h-4 w-4" />}
            {sortDirection === null && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
          </div>
        )}
      </div>
    </th>
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-slate-500 dark:text-slate-400', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

// Loading skeleton for table rows
const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <TableRow>
    {Array.from({ length: columns }).map((_, index) => (
      <TableCell key={index}>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </TableCell>
    ))}
  </TableRow>
);

const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  headers?: string[] 
}> = ({ 
  rows = 5, 
  columns = 4, 
  headers = [] 
}) => (
  <Table>
    <TableHeader>
      <TableRow>
        {headers.length > 0 ? (
          headers.map((header, index) => (
            <TableHead key={index}>{header}</TableHead>
          ))
        ) : (
          Array.from({ length: columns }).map((_, index) => (
            <TableHead key={index}>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-20" />
            </TableHead>
          ))
        )}
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowSkeleton key={index} columns={columns} />
      ))}
    </TableBody>
  </Table>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableSkeleton,
};
