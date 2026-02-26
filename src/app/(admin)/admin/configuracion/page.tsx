import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Globe,
  Database,
  Shield,
  Clock,
  Code2,
  Server,
  Zap,
  ExternalLink,
} from 'lucide-react';

export default async function AdminConfiguracionPage() {
  const user = await requireAdmin();

  // Fetch existing settings
  const settings = await prisma.setting.findMany({
    orderBy: { key: 'asc' },
  });

  const settingsMap = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  // System info
  const [articleCount, categoryCount, tagCount, userCount, indicatorCount] = await Promise.all([
    prisma.article.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.manualIndicator.count(),
  ]);

  const systemInfo = [
    { label: 'Framework', value: 'Next.js 14.2' },
    { label: 'Runtime', value: 'Node.js' },
    { label: 'Database', value: 'SQLite (dev) / PostgreSQL (prod)' },
    { label: 'ORM', value: 'Prisma 5.10' },
    { label: 'Auth', value: 'NextAuth.js' },
    { label: 'Styling', value: 'Tailwind CSS 3.4' },
  ];

  const apiStatus = [
    { name: 'BCRA', url: 'api.bcra.gob.ar', description: 'Tasas, inflación, UVA, reservas' },
    { name: 'DolarAPI', url: 'dolarapi.com', description: 'Cotizaciones del dólar' },
    { name: 'CoinGecko', url: 'api.coingecko.com', description: 'Criptomonedas' },
    { name: 'Yahoo Finance', url: 'query1.finance.yahoo.com', description: 'MERVAL, acciones' },
    { name: 'ArgentinaDatos', url: 'api.argentinadatos.com', description: 'Backup inflación, riesgo país' },
  ];

  return (
    <AdminLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Configuración</h1>
          <p className="text-sm text-text-muted mt-1">
            Información del sistema y configuración general
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database Stats */}
          <Card>
            <CardHeader
              title="Base de Datos"
              icon={<Database className="w-4 h-4 text-accent" />}
            />
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Artículos', count: articleCount },
                  { label: 'Categorías', count: categoryCount },
                  { label: 'Tags', count: tagCount },
                  { label: 'Usuarios', count: userCount },
                  { label: 'Indicadores manuales', count: indicatorCount },
                  { label: 'Settings', count: settings.length },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <span className="text-sm font-mono font-semibold text-text-primary dark:text-white">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader
              title="Stack Tecnológico"
              icon={<Code2 className="w-4 h-4 text-accent" />}
            />
            <CardContent>
              <div className="space-y-2">
                {systemInfo.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-text-secondary">{item.label}</span>
                    <Badge variant="default" size="sm">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* API Sources */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Fuentes de Datos (APIs)"
              icon={<Globe className="w-4 h-4 text-accent" />}
              description="APIs externas utilizadas para obtener datos financieros en tiempo real"
            />
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {apiStatus.map((api) => (
                  <div key={api.name} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary dark:text-white">
                          {api.name}
                        </span>
                        <a
                          href={`https://${api.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p className="text-xs text-text-muted">{api.description}</p>
                      <code className="text-xs text-text-muted/70">{api.url}</code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="lg:col-span-2">
            <CardHeader
              title="Configuraciones Guardadas"
              icon={<Settings className="w-4 h-4 text-accent" />}
              description="Variables de configuración almacenadas en la base de datos"
            />
            <CardContent>
              {settings.length === 0 ? (
                <div className="p-6 text-center">
                  <Settings className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No hay configuraciones guardadas.</p>
                  <p className="text-xs text-text-muted mt-1">
                    Las configuraciones se crearán automáticamente según se necesiten.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-medium text-text-muted uppercase bg-surface-secondary rounded-t-lg">
                    <div className="col-span-3">Clave</div>
                    <div className="col-span-6">Valor</div>
                    <div className="col-span-3">Última modificación</div>
                  </div>
                  {settings.map((setting) => (
                    <div key={setting.id} className="grid grid-cols-12 gap-4 px-3 py-2 items-center">
                      <div className="col-span-3">
                        <code className="text-xs font-mono bg-surface-secondary px-1.5 py-0.5 rounded">
                          {setting.key}
                        </code>
                      </div>
                      <div className="col-span-6">
                        <code className="text-xs text-text-secondary break-all">
                          {setting.value.length > 100 ? setting.value.slice(0, 100) + '...' : setting.value}
                        </code>
                      </div>
                      <div className="col-span-3 text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(setting.updatedAt).toLocaleString('es-AR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cache Info */}
        <Card variant="outlined" className="bg-surface-secondary/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary dark:text-white mb-1">
                  Cache en memoria
                </h3>
                <p className="text-xs text-text-muted">
                  TTLs configurados: Dólar 60s, BCRA 300s, Cripto 120s, Commodities 600s, Noticias 300s.
                  El cache se reinicia al redeployar o reiniciar el servidor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
