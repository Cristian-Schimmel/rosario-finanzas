import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import Link from 'next/link';
import {
  FileText,
  Users,
  Eye,
  TrendingUp,
  Plus,
  BarChart3,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const user = await requireAuth();

  // Fetch dashboard stats
  const [articleCount, publishedCount, draftCount, categoryCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.category.count(),
    ]);

  // Recent articles
  const recentArticles = await prisma.article.findMany({
    include: {
      category: true,
      author: {
        select: { name: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  const stats = [
    {
      label: 'Total Artículos',
      value: articleCount,
      icon: FileText,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Publicados',
      value: publishedCount,
      icon: Eye,
      color: 'text-up',
      bgColor: 'bg-up-subtle',
    },
    {
      label: 'Borradores',
      value: draftCount,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Categorías',
      value: categoryCount,
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-muted">
              Bienvenido, {user.name || user.email}
            </p>
          </div>
          <Link
            href="/admin/articulos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Artículo
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-primary">
                      {formatNumber(stat.value, { decimals: 0 })}
                    </p>
                    <p className="text-sm text-text-muted">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Articles */}
        <Card>
          <CardHeader
            title="Artículos Recientes"
            icon={<FileText className="w-4 h-4 text-accent" />}
            action={
              <Link
                href="/admin/articulos"
                className="text-sm text-accent hover:text-accent-dark flex items-center gap-1"
              >
                Ver todos
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
          />
          <div className="divide-y divide-border">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                href={`/admin/articulos/${article.id}`}
                className="flex items-center justify-between p-4 hover:bg-interactive-hover transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={article.status} />
                    {article.category && (
                      <span className="text-xs text-text-muted">
                        {article.category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium text-text-primary truncate">
                    {article.title}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {article.author?.name || 'Sin autor'} •{' '}
                    {formatRelativeTime(article.updatedAt)}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-text-muted flex-shrink-0 ml-4" />
              </Link>
            ))}

            {recentArticles.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No hay artículos aún</p>
                <Link
                  href="/admin/articulos/nuevo"
                  className="inline-flex items-center gap-1 text-accent hover:text-accent-dark mt-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear el primero
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            href="/admin/articulos/nuevo"
            icon={FileText}
            label="Nuevo Artículo"
            description="Crear un nuevo artículo"
          />
          <QuickAction
            href="/admin/categorias"
            icon={BarChart3}
            label="Categorías"
            description="Gestionar categorías"
          />
          <QuickAction
            href="/admin/indicadores"
            icon={TrendingUp}
            label="Indicadores"
            description="Gestionar indicadores manuales"
          />
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: 'positive' | 'accent' | 'default' | 'outline'; label: string }> = {
    PUBLISHED: { variant: 'positive', label: 'Publicado' },
    DRAFT: { variant: 'outline', label: 'Borrador' },
    SCHEDULED: { variant: 'accent', label: 'Programado' },
    ARCHIVED: { variant: 'default', label: 'Archivado' },
  };

  const { variant, label } = variants[status] || variants.DRAFT;

  return (
    <Badge size="sm" variant={variant}>
      {label}
    </Badge>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-text-primary">{label}</h3>
            <p className="text-sm text-text-muted">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
