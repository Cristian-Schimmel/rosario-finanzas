'use client';

import { cn } from '@/lib/utils';
import type { Trend } from '@/types';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'positive' | 'negative' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  trend?: Trend;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  trend,
  className,
}: BadgeProps) {
  // Auto-determine variant from trend if provided
  const effectiveVariant = trend
    ? trend === 'up'
      ? 'positive'
      : trend === 'down'
      ? 'negative'
      : 'default'
    : variant;

  const variants = {
    default: 'bg-bg-muted text-text-secondary dark:bg-slate-800 dark:text-slate-300',
    positive: 'bg-positive-light text-positive dark:bg-emerald-950/60 dark:text-emerald-400',
    negative: 'bg-negative-light text-negative dark:bg-rose-950/60 dark:text-rose-400',
    accent: 'bg-accent-light text-accent dark:bg-cyan-950/60 dark:text-cyan-400',
    outline: 'bg-transparent border border-border text-text-secondary dark:border-slate-700 dark:text-slate-400',
  };

  const sizes = {
    sm: 'h-5 px-1.5 text-[10px]',
    md: 'h-6 px-2 text-xs',
    lg: 'h-7 px-2.5 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded whitespace-nowrap',
        variants[effectiveVariant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Specialized badge for financial variations
export interface VariationBadgeProps {
  value: number;
  format?: 'percent' | 'number';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function VariationBadge({
  value,
  format = 'percent',
  size = 'md',
  showIcon = true,
  className,
}: VariationBadgeProps) {
  const trend: Trend = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';
  const sign = value > 0 ? '+' : '';
  const formattedValue = format === 'percent' 
    ? `${sign}${value.toFixed(2)}%`
    : `${sign}${value.toFixed(2)}`;

  const icons = {
    up: '▲',
    down: '▼',
    neutral: '–',
  };

  return (
    <Badge trend={trend} size={size} className={className}>
      {showIcon && (
        <span className="mr-0.5 text-[8px]">{icons[trend]}</span>
      )}
      {formattedValue}
    </Badge>
  );
}
