'use client';

import { useState, useMemo } from 'react';
import { cn, formatNumber } from '@/lib/utils';
import { VariationBadge } from '@/components/ui/badge';
import { SimpleTooltip } from '@/components/ui/tooltip';
import type { TableColumn, Trend } from '@/types';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  stickyHeader?: boolean;
  stickyColumn?: boolean;
  compact?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  stickyHeader = true,
  stickyColumn = false,
  compact = false,
  striped = false,
  hoverable = true,
  emptyMessage = 'No hay datos disponibles',
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <ChevronsUpDown className="w-3 h-3 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const cellPadding = compact ? 'px-3 py-1.5' : 'px-3 py-2.5';

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          <tr className="bg-bg-secondary">
            {columns.map((column, index) => (
              <th
                key={String(column.key)}
                className={cn(
                  cellPadding,
                  'text-left font-medium text-text-muted border-b border-border',
                  'whitespace-nowrap',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  stickyColumn && index === 0 && 'sticky left-0 bg-bg-secondary z-20',
                  column.sortable && 'cursor-pointer select-none hover:text-text-secondary'
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && getSortIcon(String(column.key))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'border-b border-border-muted',
                  striped && rowIndex % 2 === 1 && 'bg-bg-tertiary/50',
                  hoverable && 'hover:bg-interactive-hover transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((column, colIndex) => {
                  const value = row[column.key as keyof T];
                  const rendered = column.render
                    ? column.render(value, row)
                    : String(value ?? '-');

                  return (
                    <td
                      key={String(column.key)}
                      className={cn(
                        cellPadding,
                        'text-text-primary',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right text-data',
                        stickyColumn && colIndex === 0 && 'sticky left-0 bg-surface z-10'
                      )}
                    >
                      {rendered}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Preset column renderers
export const columnRenderers = {
  number: (decimals = 2) => (value: unknown) =>
    typeof value === 'number' ? formatNumber(value, { decimals }) : '-',

  currency: (currency = 'ARS', decimals = 2) => (value: unknown) =>
    typeof value === 'number'
      ? formatNumber(value, { style: 'currency', currency, decimals })
      : '-',

  percent: (decimals = 2) => (value: unknown) =>
    typeof value === 'number' ? `${value.toFixed(decimals)}%` : '-',

  variation: (value: unknown) => {
    if (typeof value !== 'number') return '-';
    return <VariationBadge value={value} size="sm" />;
  },

  trend: (value: unknown) => {
    const trend = value as Trend;
    const colors = {
      up: 'text-positive',
      down: 'text-negative',
      neutral: 'text-text-muted',
    };
    const icons = {
      up: '▲',
      down: '▼',
      neutral: '–',
    };
    return (
      <span className={colors[trend] || colors.neutral}>
        {icons[trend] || icons.neutral}
      </span>
    );
  },

  date: (format: 'short' | 'medium' | 'long' = 'short') => (value: unknown) => {
    if (!value) return '-';
    const date = new Date(value as string);
    const formats: Record<string, Intl.DateTimeFormatOptions> = {
      short: { day: '2-digit', month: '2-digit' },
      medium: { day: 'numeric', month: 'short' },
      long: { day: 'numeric', month: 'long', year: 'numeric' },
    };
    return new Intl.DateTimeFormat('es-AR', formats[format]).format(date);
  },
};
