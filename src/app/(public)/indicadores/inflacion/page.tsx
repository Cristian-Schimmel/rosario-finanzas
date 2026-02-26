import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MiniIndicator } from '@/components/indicators/mini-indicator';
import { Sparkline } from '@/components/indicators/sparkline';
import { getIndicatorsByCategory } from '@/lib/services/indicator-service';
import { fetchInflacionMensual, fetchInflacionInteranual, fetchInflacionHistorica } from '@/lib/services/connectors/argentina-datos';
import { fetchBCRAHistory } from '@/lib/services/connectors/bcra';
import { getInflacion, getInflacionInteranual, getUVA } from '@/lib/services/connectors/bcra';
import {
  Percent,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import type { Indicator, Trend } from '@/types';

export const revalidate = 300;

export const metadata = {
  title: 'Inflación | Rosario Finanzas',
  description: 'Inflación mensual e interanual (INDEC), UVA, CER y evolución histórica de precios.',
};

export default async function InflacionPage() {
  const [inflacionIndicators, inflacionMensual, inflacionIA, historica, uva] = await Promise.all([
    getIndicatorsByCategory('inflacion'),
    getInflacion(),
    getInflacionInteranual(),
    fetchInflacionHistorica(24),
    getUVA(),
  ]);

  // Try to get UVA history
  const historyUVA = await fetchBCRAHistory(21, 90);

  // Build chart data from historical inflation
  const chartData = historica.map(item => item.valor);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary dark:text-white flex items-center gap-2">
            <Percent className="w-5 h-5 text-orange-500" />
            Inflación
          </h1>
          <p className="text-xs text-text-muted dark:text-slate-400 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            Fuente: BCRA, INDEC vía ArgentinaDatos
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Inflación Mensual */}
        {inflacionMensual && (
          <InflationHighlightCard
            title="Inflación Mensual"
            value={inflacionMensual.value}
            unit="%"
            change={inflacionMensual.change}
            subtitle={`Fecha: ${new Date(inflacionMensual.lastUpdated).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`}
            source={String(inflacionMensual.source)}
          />
        )}

        {/* Inflación Interanual */}
        {inflacionIA && (
          <InflationHighlightCard
            title="Inflación Interanual"
            value={inflacionIA.value}
            unit="%"
            change={inflacionIA.change}
            subtitle={`Fecha: ${new Date(inflacionIA.lastUpdated).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`}
            source={String(inflacionIA.source)}
          />
        )}

        {/* UVA */}
        {uva && (
          <InflationHighlightCard
            title="UVA"
            value={uva.value}
            unit="ARS"
            change={uva.changePercent}
            subtitle={`Fecha: ${new Date(uva.lastUpdated).toLocaleDateString('es-AR')}`}
            source={String(uva.source)}
          />
        )}
      </div>

      {/* All Inflation Indicators */}
      {inflacionIndicators.length > 0 && (
        <Card>
          <CardHeader title="Indicadores de Inflación y Precios (BCRA)" />
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {inflacionIndicators.map((indicator) => (
                <MiniIndicator key={indicator.id} indicator={indicator} showIcon={true} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader title="Inflación Mensual — Últimos 24 meses" />
          <CardContent>
            <div className="h-24">
              <Sparkline
                data={chartData}
                width={800}
                height={96}
                strokeWidth={2}
                showArea={true}
              />
            </div>
            <div className="flex justify-between mt-2 text-2xs text-text-muted dark:text-slate-500">
              <span>{historica[0]?.fecha}</span>
              <span>{historica[historica.length - 1]?.fecha}</span>
            </div>

            {/* Monthly values table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border dark:border-slate-700">
                    <th className="text-left py-1.5 font-medium text-text-muted dark:text-slate-400">Período</th>
                    <th className="text-right py-1.5 font-medium text-text-muted dark:text-slate-400">IPC Mensual</th>
                    <th className="text-right py-1.5 font-medium text-text-muted dark:text-slate-400">Variación</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historica].reverse().slice(0, 12).map((item, index) => {
                    const prevItem = [...historica].reverse()[index + 1];
                    const diff = prevItem ? item.valor - prevItem.valor : 0;
                    const trend: Trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
                    return (
                      <tr key={item.fecha} className="border-b border-border-muted dark:border-slate-800">
                        <td className="py-1.5 text-text-primary dark:text-white">
                          {new Date(item.fecha).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="py-1.5 text-right font-mono font-semibold text-text-primary dark:text-white">
                          {item.valor.toFixed(1)}%
                        </td>
                        <td className="py-1.5 text-right">
                          {prevItem && (
                            <span className={trend === 'up' ? 'text-rose-600 dark:text-rose-400' : trend === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-muted'}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}pp
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* UVA Historical */}
      {historyUVA.length > 0 && (
        <Card>
          <CardHeader title="UVA — Últimos 90 días (BCRA)" />
          <CardContent>
            <div className="h-20">
              <Sparkline
                data={historyUVA}
                width={800}
                height={80}
                strokeWidth={2}
                showArea={true}
              />
            </div>
            <div className="flex justify-between mt-2 text-2xs text-text-muted dark:text-slate-500">
              <span>Hace 90 días: ${historyUVA[0]?.toLocaleString('es-AR')}</span>
              <span>Actual: ${historyUVA[historyUVA.length - 1]?.toLocaleString('es-AR')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card variant="outlined" className="bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/30">
        <CardContent>
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-medium text-amber-800 dark:text-amber-400">Fuentes oficiales</h3>
              <p className="text-2xs text-amber-700 dark:text-amber-500/80 mt-1">
                Los datos de inflación provienen del INDEC (Instituto Nacional de Estadística y Censos)
                a través del BCRA y ArgentinaDatos.com. El IPC se publica mensualmente con demora.
                El UVA y CER se actualizan diariamente por el BCRA. Estos datos son oficiales y públicos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InflationHighlightCard({
  title,
  value,
  unit,
  change,
  subtitle,
  source,
}: {
  title: string;
  value: number;
  unit: string;
  change: number;
  subtitle: string;
  source: string;
}) {
  const trend: Trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  // For inflation, down is good
  const colors = {
    up: 'border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-950/30',
    down: 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/30',
    neutral: 'border-border dark:border-slate-700 bg-surface dark:bg-slate-900/50',
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[trend]}`}>
      <h3 className="text-xs font-medium text-text-muted dark:text-slate-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold font-mono text-text-primary dark:text-white">
        {unit === '%' ? `${value.toFixed(1)}%` : `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
      </p>
      {change !== 0 && (
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up' ? (
            <TrendingUp className="w-3 h-3 text-rose-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-emerald-500" />
          )}
          <span className={`text-2xs ${trend === 'up' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}pp vs anterior
          </span>
        </div>
      )}
      <p className="text-2xs text-text-muted dark:text-slate-500 mt-2">{subtitle}</p>
      <p className="text-2xs text-text-muted dark:text-slate-500">Fuente: {source}</p>
    </div>
  );
}
