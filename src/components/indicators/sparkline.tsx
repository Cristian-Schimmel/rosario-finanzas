'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { Trend } from '@/types';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  trend?: Trend;
  showArea?: boolean;
  showDots?: boolean;
  className?: string;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  strokeWidth = 1.5,
  trend,
  showArea = true,
  showDots = false,
  className,
}: SparklineProps) {
  const { path, areaPath, effectiveTrend, points } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: '', areaPath: '', effectiveTrend: 'neutral' as Trend, points: [] };
    }

    const padding = 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Calculate trend from data if not provided
    const calculatedTrend: Trend =
      trend ||
      (data[data.length - 1] > data[0]
        ? 'up'
        : data[data.length - 1] < data[0]
        ? 'down'
        : 'neutral');

    // Generate points
    const pts = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return { x, y };
    });

    // Create path
    let pathD = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      pathD += ` L ${pts[i].x},${pts[i].y}`;
    }

    // Create area path (for fill)
    let areaD = pathD;
    areaD += ` L ${pts[pts.length - 1].x},${height - padding}`;
    areaD += ` L ${pts[0].x},${height - padding}`;
    areaD += ' Z';

    return {
      path: pathD,
      areaPath: areaD,
      effectiveTrend: calculatedTrend,
      points: pts,
    };
  }, [data, width, height, trend]);

  const colors = {
    up: {
      stroke: 'rgb(61, 122, 92)', // positive
      fill: 'rgba(61, 122, 92, 0.1)',
    },
    down: {
      stroke: 'rgb(166, 84, 84)', // negative
      fill: 'rgba(166, 84, 84, 0.1)',
    },
    neutral: {
      stroke: 'rgb(150, 131, 106)', // ivory-700
      fill: 'rgba(150, 131, 106, 0.1)',
    },
  };

  const color = colors[effectiveTrend];

  if (!path) {
    return (
      <div
        className={cn('flex items-center justify-center text-text-muted', className)}
        style={{ width, height }}
      >
        <span className="text-2xs">N/A</span>
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('flex-shrink-0', className)}
      aria-hidden="true"
    >
      {/* Area fill */}
      {showArea && (
        <path d={areaPath} fill={color.fill} />
      )}
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color.stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* End dot */}
      {showDots && points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={color.stroke}
        />
      )}
    </svg>
  );
}

// Mini sparkline for ticker items
export function MiniSparkline({
  data,
  trend,
  className,
}: {
  data: number[];
  trend?: Trend;
  className?: string;
}) {
  return (
    <Sparkline
      data={data}
      width={50}
      height={16}
      strokeWidth={1}
      trend={trend}
      showArea={false}
      className={className}
    />
  );
}
