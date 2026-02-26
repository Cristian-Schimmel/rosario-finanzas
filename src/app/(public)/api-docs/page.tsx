import { MainLayout } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Code2,
  Globe,
  Clock,
  Shield,
  Zap,
  Database,
  ExternalLink,
  Copy,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export const metadata = {
  title: 'API & Datos | Rosario Finanzas',
  description: 'Documentación de los endpoints de datos financieros de Rosario Finanzas.',
};

const endpoints = [
  {
    method: 'GET',
    path: '/api/indicators',
    description: 'Resumen completo del mercado: dólar, tasas, inflación, cripto, agro.',
    revalidate: '60s',
    response: 'MarketOverview { groups, tickerItems, lastUpdated }',
  },
  {
    method: 'GET',
    path: '/api/indicators/dolar',
    description: 'Cotizaciones de todas las variantes del dólar en Argentina.',
    revalidate: '60s',
    response: 'DollarQuote[] con compra, venta, variación',
  },
  {
    method: 'GET',
    path: '/api/indicators/cripto',
    description: 'Precios de criptomonedas principales (BTC, ETH, SOL, XRP, USDT).',
    revalidate: '120s',
    response: 'CryptoPrice[] con precio USD y variación 24h',
  },
  {
    method: 'GET',
    path: '/api/indicators/commodities',
    description: 'Precios de commodities agrícolas y energéticos.',
    revalidate: '600s',
    response: 'Commodity[] con precio, unidad, fuente',
  },
  {
    method: 'GET',
    path: '/api/indicators/ticker',
    description: 'Items formateados para el ticker/cintillo.',
    revalidate: '60s',
    response: 'TickerItem[] con label, value, change',
  },
  {
    method: 'GET',
    path: '/api/market/summary',
    description: 'Resumen del mercado argentino: MERVAL, acciones líderes.',
    revalidate: '120s',
    response: 'MarketSummary con indices, topGainers, topLosers',
  },
  {
    method: 'GET',
    path: '/api/market/historical?symbol=MERVAL&period=1M',
    description: 'Datos históricos de índices bursátiles.',
    revalidate: '300s',
    response: 'HistoricalData[] con timestamp, open, high, low, close, volume',
  },
  {
    method: 'GET',
    path: '/api/news/processed',
    description: 'Noticias procesadas de medios argentinos con IA.',
    revalidate: '300s',
    response: 'ProcessedNews[] con título, resumen, categoría, sentimiento',
  },
  {
    method: 'GET',
    path: '/api/health',
    description: 'Estado de salud de la API y sus dependencias.',
    revalidate: 'No cache',
    response: '{ status, uptime, services }',
  },
];

const dataSources = [
  {
    name: 'BCRA',
    url: 'https://api.bcra.gob.ar',
    description: 'Banco Central de la República Argentina - Variables principales, tasas, inflación, UVA.',
    data: ['Tasa de Política Monetaria', 'BADLAR', 'UVA/CER', 'Inflación mensual/interanual', 'Tipo de cambio mayorista', 'Reservas', 'Base monetaria'],
  },
  {
    name: 'DolarAPI',
    url: 'https://dolarapi.com',
    description: 'API pública de cotizaciones del dólar en Argentina.',
    data: ['Dólar Oficial', 'Dólar Blue', 'Dólar MEP', 'Dólar CCL', 'Dólar Cripto', 'Dólar Tarjeta'],
  },
  {
    name: 'CoinGecko',
    url: 'https://www.coingecko.com',
    description: 'Precios de criptomonedas en tiempo real.',
    data: ['Bitcoin (BTC)', 'Ethereum (ETH)', 'Solana (SOL)', 'Ripple (XRP)', 'Tether (USDT)'],
  },
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com',
    description: 'Datos históricos y en tiempo real del índice MERVAL.',
    data: ['Índice MERVAL (^MERV)', 'Datos históricos 1D-1Y', 'Datos intradiarios'],
  },
  {
    name: 'ArgentinaDatos',
    url: 'https://api.argentinadatos.com',
    description: 'Fuente de respaldo para inflación, riesgo país y cotizaciones.',
    data: ['Inflación histórica', 'Riesgo País', 'Cotizaciones como backup', 'Precio de Soja Rosario'],
  },
];

export default function ApiDocsPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary dark:text-white">
                API & Datos
              </h1>
              <p className="text-sm text-text-muted dark:text-slate-400">
                Endpoints disponibles y fuentes de datos del portal
              </p>
            </div>
          </div>
        </header>

        {/* Warning */}
        <Card variant="outlined" className="bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900/30 mb-8">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-1">
                  API de uso interno
                </h3>
                <p className="text-xs text-text-muted">
                  Estos endpoints están diseñados para consumo interno del portal. 
                  No garantizamos estabilidad ni disponibilidad para uso externo. 
                  Para datos oficiales, consultá las fuentes originales listadas abajo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Endpoints */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              Endpoints
            </h2>
            
            <div className="space-y-3">
              {endpoints.map((ep) => (
                <Card key={ep.path} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="positive" size="sm" className="flex-shrink-0 mt-0.5 font-mono">
                        {ep.method}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <code className="text-sm font-mono font-semibold text-text-primary dark:text-white break-all">
                          {ep.path}
                        </code>
                        <p className="text-xs text-text-muted mt-1">
                          {ep.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Cache: {ep.revalidate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {ep.response}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Architecture */}
            <section className="mt-8">
              <h2 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-accent" />
                Arquitectura de datos
              </h2>
              <Card>
                <CardContent className="p-5">
                  <div className="space-y-4 text-sm text-text-secondary">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-text-primary dark:text-white">Cache multi-nivel</h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Cache en memoria (in-process) con TTLs diferenciados por tipo de dato:
                          dólar 1min, BCRA 5min, cripto 2min, commodities 10min, noticias 5min.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Database className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-text-primary dark:text-white">Fallback automático</h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Si la fuente principal falla (ej: BCRA), el sistema intenta automáticamente 
                          con ArgentinaDatos como backup. Los datos de respaldo se marcan visualmente.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-text-primary dark:text-white">ISR (Incremental Static Regeneration)</h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Las páginas se regeneran automáticamente según su TTL configurado,
                          ofreciendo datos frescos sin sacrificar performance.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar - Data Sources */}
          <aside className="space-y-4">
            <h2 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              Fuentes de datos
            </h2>

            {dataSources.map((source) => (
              <Card key={source.name}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-text-primary dark:text-white">
                      {source.name}
                    </h3>
                    <a 
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs text-text-muted mb-2">
                    {source.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {source.data.map((item) => (
                      <Badge key={item} variant="default" size="sm">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Stack Info */}
            <Card variant="outlined" className="bg-surface-secondary/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-2">
                  Stack Tecnológico
                </h3>
                <div className="flex flex-wrap gap-1">
                  {['Next.js 14', 'TypeScript', 'Prisma', 'Tailwind CSS', 'ISR', 'Server Components'].map((tech) => (
                    <Badge key={tech} variant="outline" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
