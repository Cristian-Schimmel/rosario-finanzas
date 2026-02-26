'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SimpleTooltip } from '@/components/ui/tooltip';

export interface HeatmapCell {
  id: string;
  label: string;
  value: number;
  displayValue?: string;
}

export interface HeatmapProps {
  data: HeatmapCell[];
  minValue?: number;
  maxValue?: number;
  columns?: number;
  cellSize?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export function Heatmap({
  data,
  minValue,
  maxValue,
  columns = 5,
  cellSize = 'md',
  showLabels = true,
  className,
}: HeatmapProps) {
  const { min, max, normalizedData } = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = minValue ?? Math.min(...values);
    const max = maxValue ?? Math.max(...values);
    const range = max - min || 1;

    const normalized = data.map((d) => ({
      ...d,
      normalizedValue: (d.value - min) / range,
    }));

    return { min, max, normalizedData: normalized };
  }, [data, minValue, maxValue]);

  const getColor = (normalizedValue: number, value: number) => {
    // Positive/negative coloring
    if (value > 0) {
      // Green gradient
      const intensity = Math.min(normalizedValue * 1.2, 1);
      return `rgba(61, 122, 92, ${0.2 + intensity * 0.6})`;
    } else if (value < 0) {
      // Red gradient
      const intensity = Math.min(Math.abs(normalizedValue) * 1.2, 1);
      return `rgba(166, 84, 84, ${0.2 + intensity * 0.6})`;
    }
    return 'rgba(150, 131, 106, 0.2)';
  };

  const sizes = {
    sm: 'w-12 h-12 text-2xs',
    md: 'w-16 h-16 text-xs',
    lg: 'w-20 h-20 text-sm',
  };

  return (
    <div
      className={cn('grid gap-1', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {normalizedData.map((cell) => (
        <SimpleTooltip
          key={cell.id}
          content={`${cell.label}: ${cell.displayValue || cell.value.toFixed(2)}%`}
        >
          <div
            className={cn(
              'flex flex-col items-center justify-center rounded-md',
              'transition-transform hover:scale-105 cursor-pointer',
              sizes[cellSize]
            )}
            style={{ backgroundColor: getColor(cell.normalizedValue, cell.value) }}
          >
            {showLabels && (
              <>
                <span className="font-medium text-text-primary truncate max-w-full px-1">
                  {cell.label}
                </span>
                <span className="text-text-secondary">
                  {cell.displayValue || `${cell.value > 0 ? '+' : ''}${cell.value.toFixed(1)}%`}
                </span>
              </>
            )}
          </div>
        </SimpleTooltip>
      ))}
    </div>
  );
}

// Mini heatmap for cards/summaries
export function MiniHeatmap({
  data,
  className,
}: {
  data: { value: number; label?: string }[];
  className?: string;
}) {
  const getColor = (value: number) => {
    if (value > 0) {
      const intensity = Math.min(value / 5, 1); // 5% max intensity
      return `rgba(61, 122, 92, ${0.3 + intensity * 0.5})`;
    } else if (value < 0) {
      const intensity = Math.min(Math.abs(value) / 5, 1);
      return `rgba(166, 84, 84, ${0.3 + intensity * 0.5})`;
    }
    return 'rgba(150, 131, 106, 0.2)';
  };

  return (
    <div className={cn('flex gap-0.5', className)}>
      {data.map((cell, i) => (
        <SimpleTooltip
          key={i}
          content={cell.label || `${cell.value > 0 ? '+' : ''}${cell.value.toFixed(1)}%`}
        >
          <div
            className="w-3 h-3 rounded-sm cursor-pointer hover:ring-1 hover:ring-accent"
            style={{ backgroundColor: getColor(cell.value) }}
          />
        </SimpleTooltip>
      ))}
    </div>
  );
}

// Weekly performance heatmap
export interface WeeklyHeatmapProps {
  data: {
    day: string;
    value: number;
  }[];
  className?: string;
}

export function WeeklyHeatmap({ data, className }: WeeklyHeatmapProps) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const getColor = (value: number | undefined) => {
    if (value === undefined) return 'bg-bg-muted';
    if (value > 0) return 'bg-positive/30';
    if (value < 0) return 'bg-negative/30';
    return 'bg-bg-muted';
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex gap-0.5">
        {days.map((day, i) => (
          <div
            key={i}
            className="w-5 text-center text-2xs text-text-muted"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex gap-0.5">
        {days.map((_, i) => {
          const dayData = data[i];
          return (
            <SimpleTooltip
              key={i}
              content={
                dayData
                  ? `${dayData.day}: ${dayData.value > 0 ? '+' : ''}${dayData.value.toFixed(2)}%`
                  : 'Sin datos'
              }
            >
              <div
                className={cn(
                  'w-5 h-5 rounded-sm cursor-pointer',
                  'hover:ring-1 hover:ring-accent',
                  getColor(dayData?.value)
                )}
              />
            </SimpleTooltip>
          );
        })}
      </div>
    </div>
  );
}
