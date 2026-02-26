'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

export interface ChartDataPoint {
  date: Date | string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  previousClose: number;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  indexData: MarketIndexData;
  title?: string;
  height?: number;
  className?: string;
  onPeriodChange?: (period: string) => void;
  initialPeriod?: string;
  showVolume?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const PERIODS = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1S' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '1Y', label: '1A' },
  { value: 'YTD', label: 'YTD' },
];

function formatDate(date: Date | string, period: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (period === '1D') {
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }
  
  if (period === '1W' || period === '1M') {
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }
  
  return d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
}

function formatValue(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString('es-AR', { maximumFractionDigits: 2 })}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString('es-AR', { maximumFractionDigits: 2 })}K`;
  }
  return value.toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

function formatFullValue(value: number): string {
  return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  label?: string;
  period: string;
}

function CustomTooltip({ active, payload, label, period }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  const date = typeof data.date === 'string' ? new Date(data.date) : data.date;
  
  return (
    <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[180px]">
      <p className="text-xs text-text-muted dark:text-slate-400 mb-2">
        {date.toLocaleDateString('es-AR', { 
          weekday: 'short', 
          day: '2-digit', 
          month: 'short',
          year: period !== '1D' && period !== '1W' ? '2-digit' : undefined,
        })}
        {period === '1D' && ` ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-xs text-text-muted dark:text-slate-500">Apertura:</span>
          <span className="text-xs font-medium text-text-primary dark:text-white">{formatFullValue(data.open)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-text-muted dark:text-slate-500">Máximo:</span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{formatFullValue(data.high)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-text-muted dark:text-slate-500">Mínimo:</span>
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{formatFullValue(data.low)}</span>
        </div>
        <div className="flex justify-between border-t border-border dark:border-slate-700 pt-1 mt-1">
          <span className="text-xs font-medium text-text-muted dark:text-slate-400">Cierre:</span>
          <span className="text-sm font-bold text-text-primary dark:text-white">{formatFullValue(data.close)}</span>
        </div>
      </div>
    </div>
  );
}

export function InteractiveMarketChart({
  data,
  indexData,
  title,
  height = 350,
  className,
  onPeriodChange,
  initialPeriod = '1M',
  showVolume = false,
  autoRefresh = true,
  refreshInterval = 60000,
}: InteractiveChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const trend = indexData.changePercent > 0 ? 'up' : indexData.changePercent < 0 ? 'down' : 'neutral';
  
  const trendColors = {
    up: {
      gradient: ['#10b981', '#059669'],
      fill: 'url(#colorUp)',
      stroke: '#10b981',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    down: {
      gradient: ['#ef4444', '#dc2626'],
      fill: 'url(#colorDown)',
      stroke: '#ef4444',
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    neutral: {
      gradient: ['#6b7280', '#4b5563'],
      fill: 'url(#colorNeutral)',
      stroke: '#6b7280',
      text: 'text-slate-600 dark:text-slate-400',
      bg: 'bg-slate-50 dark:bg-slate-800/30',
    },
  };

  const colors = trendColors[trend];

  // Memoize chart data
  const chartData = useMemo(() => {
    return data.map((point) => ({
      ...point,
      dateLabel: formatDate(point.date, selectedPeriod),
    }));
  }, [data, selectedPeriod]);

  // Calculate min/max for Y axis with padding
  const { minValue, maxValue } = useMemo(() => {
    if (!chartData.length) return { minValue: 0, maxValue: 100 };
    
    const closes = chartData.map(d => d.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const padding = (max - min) * 0.1;
    
    return {
      minValue: Math.floor(min - padding),
      maxValue: Math.ceil(max + padding),
    };
  }, [chartData]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onPeriodChange?.(selectedPeriod);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedPeriod]);

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Title and Index Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-accent dark:text-cyan-400" />
              <h3 className="font-semibold text-lg text-text-primary dark:text-white">
                {title || indexData.name}
              </h3>
              <Badge 
                size="sm" 
                variant={trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'default'}
                className="ml-1"
              >
                {trend === 'up' ? 'Alza' : trend === 'down' ? 'Baja' : 'Estable'}
              </Badge>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-text-primary dark:text-white font-mono">
                {formatFullValue(indexData.value)}
              </span>
              <div className={cn('flex items-center gap-1', colors.text)}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {indexData.changePercent >= 0 ? '+' : ''}{indexData.changePercent.toFixed(2)}%
                </span>
                <span className="text-xs opacity-80">
                  ({indexData.change >= 0 ? '+' : ''}{formatFullValue(indexData.change)})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-1 text-xs text-text-muted dark:text-slate-500">
              <span>Máx: <span className="text-emerald-600 dark:text-emerald-400">{formatFullValue(indexData.high)}</span></span>
              <span>Mín: <span className="text-rose-600 dark:text-rose-400">{formatFullValue(indexData.low)}</span></span>
              <span>Ant: {formatFullValue(indexData.previousClose)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <div className="flex bg-bg-secondary dark:bg-slate-800/80 rounded-lg p-0.5">
              {PERIODS.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-all',
                    selectedPeriod === period.value
                      ? 'bg-white dark:bg-slate-700 text-text-primary dark:text-white shadow-sm'
                      : 'text-text-muted dark:text-slate-400 hover:text-text-primary dark:hover:text-white'
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'bg-bg-secondary dark:bg-slate-800 hover:bg-interactive-hover dark:hover:bg-slate-700',
                'text-text-muted dark:text-slate-400',
                isRefreshing && 'animate-spin'
              )}
              title="Actualizar datos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-2">
        {/* Chart */}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="currentColor"
                className="text-border dark:text-slate-800"
                vertical={false}
              />
              
              <XAxis
                dataKey="dateLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                className="text-text-muted dark:text-slate-500"
                interval="preserveStartEnd"
                minTickGap={50}
              />
              
              <YAxis
                domain={[minValue, maxValue]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                className="text-text-muted dark:text-slate-500"
                tickFormatter={formatValue}
                width={60}
              />
              
              <Tooltip 
                content={<CustomTooltip period={selectedPeriod} />}
                cursor={{ stroke: colors.stroke, strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              
              {/* Reference line for previous close */}
              <ReferenceLine
                y={indexData.previousClose}
                stroke="#9ca3af"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              
              <Area
                type="monotone"
                dataKey="close"
                stroke={colors.stroke}
                strokeWidth={2}
                fill={colors.fill}
                animationDuration={500}
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: colors.stroke,
                  strokeWidth: 2,
                  fill: '#fff',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-text-muted dark:text-slate-500">
            <Clock className="w-3 h-3" />
            <span>
              Última actualización: {lastUpdate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <span className="text-xs text-text-muted dark:text-slate-500">
            Datos con 20 min. de demora - Fuente: BYMA
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini version for dashboard
export function MiniMarketChart({
  data,
  trend,
  height = 40,
  className,
}: {
  data: number[];
  trend: 'up' | 'down' | 'neutral';
  height?: number;
  className?: string;
}) {
  const chartData = data.map((value, index) => ({ value, index }));
  
  const strokeColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`mini-${trend}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={`url(#mini-${trend})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
