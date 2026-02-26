import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Tags,
  Plus,
  FileText,
  Hash,
} from 'lucide-react';

export default async function AdminTagsPage() {
  const user = await requireAuth();

  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <AdminLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Tags</h1>
            <p className="text-sm text-text-muted mt-1">
              Administrar etiquetas de artículos
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium opacity-50 cursor-not-allowed">
            <Plus className="w-4 h-4" />
            Nuevo Tag
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">{tags.length}</p>
              <p className="text-xs text-text-muted">Tags totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">
                {tags.filter(t => (t as any)._count?.articles > 0).length}
              </p>
              <p className="text-xs text-text-muted">Tags en uso</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">
                {tags.filter(t => (t as any)._count?.articles === 0).length}
              </p>
              <p className="text-xs text-text-muted">Sin artículos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">
                {tags.reduce((sum, t) => sum + ((t as any)._count?.articles ?? 0), 0)}
              </p>
              <p className="text-xs text-text-muted">Usos totales</p>
            </CardContent>
          </Card>
        </div>

        {/* Tags Grid */}
        <Card>
          <CardHeader title="Todos los Tags" />
          <CardContent>
            {tags.length === 0 ? (
              <div className="p-8 text-center">
                <Tags className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">No hay tags creados aún.</p>
                <p className="text-xs text-text-muted mt-1">
                  Los tags se crean automáticamente al asignarlos a artículos.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-surface-secondary rounded-lg border border-border hover:border-accent/30 transition-colors"
                  >
                    <Hash className="w-3 h-3 text-accent" />
                    <span className="text-sm font-medium text-text-primary dark:text-white">
                      {tag.name}
                    </span>
                    <Badge variant="default" size="sm">
                      {(tag as any)._count?.articles ?? 0}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card variant="outlined" className="bg-surface-secondary/30">
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">
              <strong>Nota:</strong> La edición y eliminación de tags estará disponible próximamente. 
              Los tags se pueden asignar desde el editor de artículos.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
