'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'skeleton animate-pulse';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (lines > 1 && variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, variantClasses.text, className)}
            style={{
              ...style,
              width: i === lines - 1 ? '75%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

// Preset skeletons for common patterns
export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" width={60} height={24} />
      </div>
      <Skeleton variant="text" width="60%" height={32} />
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="text" width="30%" />
      </div>
    </div>
  );
}

export function SkeletonIndicatorCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="50%" height={14} />
        <Skeleton variant="rectangular" width={50} height={20} />
      </div>
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="rectangular" width="100%" height={24} />
      <Skeleton variant="text" width="40%" height={12} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 pb-2 border-b border-border">
        <Skeleton variant="text" width="20%" height={16} />
        <Skeleton variant="text" width="15%" height={16} />
        <Skeleton variant="text" width="15%" height={16} />
        <Skeleton variant="text" width="15%" height={16} />
        <Skeleton variant="text" width="15%" height={16} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton variant="text" width="20%" height={14} />
          <Skeleton variant="text" width="15%" height={14} />
          <Skeleton variant="text" width="15%" height={14} />
          <Skeleton variant="text" width="15%" height={14} />
          <Skeleton variant="text" width="15%" height={14} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTicker() {
  return (
    <div className="flex items-center gap-6 h-9 px-4 bg-bg-secondary">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="text" width={50} height={14} />
          <Skeleton variant="rectangular" width={45} height={18} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonNewsCard() {
  return (
    <div className="card overflow-hidden">
      <Skeleton variant="rectangular" className="w-full aspect-video" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width={60} height={20} />
          <Skeleton variant="rectangular" width={60} height={20} />
        </div>
        <Skeleton variant="text" lines={2} />
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="text" width="30%" height={12} />
        </div>
      </div>
    </div>
  );
}
