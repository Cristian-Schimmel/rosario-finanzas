import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge, VariationBadge } from '@/components/ui/badge';
import { fetchCryptoPrices } from '@/lib/services/connectors/crypto';
import { Sparkline } from '@/components/indicators/sparkline';
import {
  Bitcoin,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ExternalLink,
  BarChart3,
  DollarSign,
  Activity,
} from 'lucide-react';
import type { Indicator, Trend } from '@/types';

export const revalidate = 120;

export const metadata = {
  title: 'Criptomonedas | Rosario Finanzas',
  description: 'Cotizaciones de Bitcoin, Ethereum, Solana, XRP y más criptomonedas en tiempo real.',
};

export default async function CriptoPage() {
  const cryptoResult = await fetchCryptoPrices();
  const { indicators, lastUpdated } = cryptoResult;

  // Sort by market cap (value as proxy since we have BTC first)
  const sorted = [...indicators].sort((a, b) => b.value - a.value);

  // Calculate total market (just the coins we track)
  const totalValue = indicators.reduce((sum, ind) => sum + ind.value, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-amber-500" />
            Criptomonedas
          </h1>
          <p className="text-xs text-text-muted dark:text-slate-400 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            Actualización cada 2 min — Fuente: CoinGecko API
          </p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((crypto) => (
          <CryptoDetailCard key={crypto.id} crypto={crypto} />
        ))}
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader title="Cotizaciones Detalladas" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border dark:border-slate-700">
                  <th className="text-left py-2 font-medium text-text-muted dark:text-slate-400">#</th>
                  <th className="text-left py-2 font-medium text-text-muted dark:text-slate-400">Criptomoneda</th>
                  <th className="text-right py-2 font-medium text-text-muted dark:text-slate-400">Precio (USD)</th>
                  <th className="text-right py-2 font-medium text-text-muted dark:text-slate-400">Variación 24h</th>
                  <th className="text-right py-2 font-medium text-text-muted dark:text-slate-400">Valor Anterior</th>
                  <th className="text-right py-2 font-medium text-text-muted dark:text-slate-400">Fuente</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((crypto, index) => {
                  const trend: Trend = crypto.changePercent > 0 ? 'up' : crypto.changePercent < 0 ? 'down' : 'neutral';
                  return (
                    <tr key={crypto.id} className="border-b border-border-muted dark:border-slate-800 hover:bg-interactive-hover dark:hover:bg-slate-800/50">
                      <td className="py-2.5 text-text-muted dark:text-slate-500">{index + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-text-primary dark:text-white">{crypto.shortName}</span>
                          <span className="text-text-muted dark:text-slate-400">{crypto.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-text-primary dark:text-white">
                        ${crypto.value.toLocaleString('en-US', { minimumFractionDigits: crypto.value > 100 ? 0 : 2, maximumFractionDigits: crypto.value > 100 ? 0 : 2 })}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-text-muted dark:text-slate-400'}>
                          {crypto.changePercent > 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-text-muted dark:text-slate-400">
                        ${crypto.previousValue.toLocaleString('en-US', { minimumFractionDigits: crypto.value > 100 ? 0 : 2, maximumFractionDigits: crypto.value > 100 ? 0 : 2 })}
                      </td>
                      <td className="py-2.5 text-right text-2xs text-text-muted dark:text-slate-500">
                        CoinGecko
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Dominancia de Mercado (tracking)" />
          <CardContent>
            <div className="space-y-2">
              {sorted.map((crypto) => {
                const dominance = totalValue > 0 ? (crypto.value / totalValue) * 100 : 0;
                return (
                  <div key={crypto.id} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary dark:text-slate-300 w-12">{crypto.shortName}</span>
                    <div className="flex-1 mx-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{ width: `${dominance}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-text-primary dark:text-white w-16 text-right">
                      {dominance.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card variant="outlined" className="bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/30">
          <CardContent>
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-medium text-amber-800 dark:text-amber-400">Aviso sobre criptomonedas</h3>
                <p className="text-2xs text-amber-700 dark:text-amber-500/80 mt-1">
                  Los precios se obtienen de CoinGecko y representan un promedio global de
                  múltiples exchanges. Los precios pueden diferir de los que ofrecen los exchanges
                  locales (ej: Ripio, Lemon, Buenbit). Las criptomonedas son activos de alta volatilidad.
                  Esta información no constituye asesoramiento financiero.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CryptoDetailCard({ crypto }: { crypto: Indicator }) {
  const trend: Trend = crypto.changePercent > 0 ? 'up' : crypto.changePercent < 0 ? 'down' : 'neutral';

  const colors = {
    up: 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/30',
    down: 'border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/30',
    neutral: 'border-border dark:border-slate-700 bg-surface dark:bg-slate-900/50',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className={`rounded-lg border p-4 ${colors[trend]} transition-colors`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-text-primary dark:text-white">{crypto.shortName}</h3>
          <span className="text-2xs text-text-muted dark:text-slate-400">{crypto.name}</span>
        </div>
        {!crypto.isFallback && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </div>

      <p className="text-2xl font-bold font-mono text-text-primary dark:text-white mb-1">
        ${crypto.value.toLocaleString('en-US', { minimumFractionDigits: crypto.value > 100 ? 0 : 2, maximumFractionDigits: crypto.value > 100 ? 0 : 2 })}
      </p>

      <div className="flex items-center gap-2">
        <TrendIcon className={`w-3.5 h-3.5 ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-400'}`} />
        <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : trend === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-text-muted'}`}>
          {crypto.changePercent > 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
        </span>
        <span className="text-2xs text-text-muted dark:text-slate-500">24h</span>
      </div>
    </div>
  );
}
