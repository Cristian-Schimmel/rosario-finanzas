import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function ArticulosPage({ searchParams }: PageProps) {
  const user = await requireAuth();
  const params = await searchParams;

  const page = parseInt(params.page || '1');
  const status = params.status;
  const categorySlug = params.category;
  const search = params.search;
  const perPage = 20;

  // Build query
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Fetch articles
  const [articles, totalCount, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: true,
        author: {
          select: { name: true },
        },
        _count: {
          select: { tags: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.article.count({ where }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  const statuses = [
    { value: '', label: 'Todos' },
    { value: 'PUBLISHED', label: 'Publicados' },
    { value: 'DRAFT', label: 'Borradores' },
    { value: 'SCHEDULED', label: 'Programados' },
    { value: 'ARCHIVED', label: 'Archivados' },
  ];

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Artículos</h1>
            <p className="text-text-muted">
              {totalCount} artículo{totalCount !== 1 ? 's' : ''} en total
            </p>
          </div>
          <Link
            href="/admin/articulos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-dark transition-colors self-start"
          >
            <Plus className="w-4 h-4" />
            Nuevo Artículo
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <form action="/admin/articulos">
                <Input
                  type="search"
                  name="search"
                  placeholder="Buscar artículos..."
                  defaultValue={search}
                  className="pl-10"
                />
                {status && <input type="hidden" name="status" value={status} />}
                {categorySlug && (
                  <input type="hidden" name="category" value={categorySlug} />
                )}
              </form>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {statuses.map((s) => (
                <Link
                  key={s.value}
                  href={{
                    pathname: '/admin/articulos',
                    query: {
                      ...(search && { search }),
                      ...(categorySlug && { category: categorySlug }),
                      ...(s.value && { status: s.value }),
                    },
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    (s.value === '' && !status) || status === s.value
                      ? 'bg-accent text-white'
                      : 'bg-surface-secondary text-text-secondary hover:bg-accent/10'
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* Articles Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-secondary border-b border-border">
                <tr>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Artículo
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                    Categoría
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                    Autor
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Estado
                  </th>
                  <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                    Actualizado
                  </th>
                  <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles.map((article) => (
                  <tr
                    key={article.id}
                    className="hover:bg-surface-secondary/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/articulos/${article.id}`}
                        className="block"
                      >
                        <h3 className="font-medium text-text-primary hover:text-accent transition-colors line-clamp-1">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="text-sm text-text-muted line-clamp-1 mt-0.5">
                            {article.excerpt}
                          </p>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      {article.category ? (
                        <Badge size="sm" variant="default">
                          {article.category.name}
                        </Badge>
                      ) : (
                        <span className="text-text-muted text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-text-secondary">
                        {article.author?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={article.status} />
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-sm text-text-muted">
                        {formatRelativeTime(article.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/noticias/${article.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-surface-secondary transition-colors"
                          title="Ver artículo"
                        >
                          <Eye className="w-4 h-4 text-text-muted" />
                        </Link>
                        <Link
                          href={`/admin/articulos/${article.id}`}
                          className="p-2 rounded-lg hover:bg-surface-secondary transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4 text-text-muted" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {articles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                      <p className="text-text-muted mb-2">
                        No se encontraron artículos
                      </p>
                      <Link
                        href="/admin/articulos/nuevo"
                        className="inline-flex items-center gap-1 text-accent hover:text-accent-dark"
                      >
                        <Plus className="w-4 h-4" />
                        Crear artículo
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-text-muted">
                Mostrando {(page - 1) * perPage + 1} a{' '}
                {Math.min(page * perPage, totalCount)} de {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={{
                    pathname: '/admin/articulos',
                    query: {
                      ...(search && { search }),
                      ...(status && { status }),
                      ...(categorySlug && { category: categorySlug }),
                      page: page - 1,
                    },
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    page === 1
                      ? 'text-text-muted pointer-events-none'
                      : 'hover:bg-surface-secondary text-text-secondary'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
                <span className="text-sm text-text-secondary">
                  {page} / {totalPages}
                </span>
                <Link
                  href={{
                    pathname: '/admin/articulos',
                    query: {
                      ...(search && { search }),
                      ...(status && { status }),
                      ...(categorySlug && { category: categorySlug }),
                      page: page + 1,
                    },
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    page === totalPages
                      ? 'text-text-muted pointer-events-none'
                      : 'hover:bg-surface-secondary text-text-secondary'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    { variant: 'positive' | 'accent' | 'default' | 'outline'; label: string }
  > = {
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
