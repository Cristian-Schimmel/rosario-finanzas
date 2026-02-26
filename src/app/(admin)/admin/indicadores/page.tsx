import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import {
  BarChart3,
  Plus,
  Clock,
  Database,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export default async function AdminIndicadoresPage() {
  const user = await requireAuth();

  const indicators = await prisma.manualIndicator.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  // Group by category
  const grouped = indicators.reduce((acc, ind) => {
    if (!acc[ind.category]) acc[ind.category] = [];
    acc[ind.category].push(ind);
    return acc;
  }, {} as Record<string, typeof indicators>);

  const categoryLabels: Record<string, string> = {
    cambios: 'Tipo de Cambio',
    tasas: 'Tasas de Interés',
    inflacion: 'Inflación',
    actividad: 'Actividad Económica',
    mercados: 'Mercados',
    agro: 'Agro / Commodities',
    cripto: 'Criptomonedas',
    energia: 'Energía',
  };

  return (
    <AdminLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Indicadores Manuales</h1>
            <p className="text-sm text-text-muted mt-1">
              Indicadores cargados manualmente que complementan los datos de APIs
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium opacity-50 cursor-not-allowed">
            <Plus className="w-4 h-4" />
            Nuevo Indicador
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">{indicators.length}</p>
              <p className="text-xs text-text-muted">Indicadores manuales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">{Object.keys(grouped).length}</p>
              <p className="text-xs text-text-muted">Categorías</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-500">
                <Database className="w-5 h-5" />
              </div>
              <p className="text-xs text-text-muted mt-1">6 APIs automáticas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500">
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="text-xs text-text-muted mt-1">Auto-actualización</p>
            </CardContent>
          </Card>
        </div>

        {/* API-based indicators info */}
        <Card variant="outlined" className="bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-1">
                  Indicadores automáticos
                </h3>
                <p className="text-xs text-text-muted mb-2">
                  La mayoría de indicadores se obtienen automáticamente de APIs externas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {['BCRA (tasas, inflación, UVA)', 'DolarAPI (cotizaciones)', 'CoinGecko (cripto)', 'Yahoo Finance (MERVAL)', 'ArgentinaDatos (backup)', 'Ámbito (soja Rosario)'].map((src) => (
                    <Badge key={src} variant="default" size="sm">{src}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Indicators Table */}
        {indicators.length === 0 ? (
          <Card className="p-8 text-center">
            <BarChart3 className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary mb-2">No hay indicadores manuales cargados.</p>
            <p className="text-xs text-text-muted">
              Los indicadores manuales permiten cargar datos que no están disponibles vía API
              (ej: Soja Rosario Bolsa de Comercio, datos locales específicos).
            </p>
          </Card>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <Card key={category}>
              <CardHeader
                title={categoryLabels[category] || category}
                description={`${items.length} indicador${items.length > 1 ? 'es' : ''}`}
              />
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-text-muted uppercase bg-surface-secondary">
                    <div className="col-span-3">Nombre</div>
                    <div className="col-span-2">Código</div>
                    <div className="col-span-2 text-right">Valor</div>
                    <div className="col-span-2">Fuente</div>
                    <div className="col-span-3">Última actualización</div>
                  </div>
                  {items.map((ind) => (
                    <div key={ind.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-surface-secondary/50">
                      <div className="col-span-3">
                        <span className="text-sm font-medium text-text-primary dark:text-white">{ind.name}</span>
                        <span className="text-xs text-text-muted block">{ind.shortName}</span>
                      </div>
                      <div className="col-span-2">
                        <code className="text-xs bg-surface-secondary px-1.5 py-0.5 rounded">{ind.code}</code>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-mono font-semibold text-text-primary dark:text-white">
                          {formatNumber(ind.value, { decimals: 2 })}
                        </span>
                        {ind.unit && <span className="text-xs text-text-muted ml-1">{ind.unit}</span>}
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-text-muted">{ind.source}</span>
                      </div>
                      <div className="col-span-3 flex items-center gap-1 text-xs text-text-muted">
                        <Clock className="w-3 h-3" />
                        {new Date(ind.updatedAt).toLocaleString('es-AR')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Info */}
        <Card variant="outlined" className="bg-surface-secondary/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-muted">
                <strong>Nota:</strong> El formulario de carga y edición de indicadores manuales 
                estará disponible próximamente. Por ahora, los datos se gestionan directamente 
                en la base de datos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
