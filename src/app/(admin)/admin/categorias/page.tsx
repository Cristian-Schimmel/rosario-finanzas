import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  FileText,
  Clock,
} from 'lucide-react';

export default async function AdminCategoriasPage() {
  const user = await requireAuth();

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  return (
    <AdminLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Categorías</h1>
            <p className="text-sm text-text-muted mt-1">
              Administrar categorías de artículos
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium opacity-50 cursor-not-allowed">
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </span>
        </div>

        {/* Categories List */}
        <Card>
          <CardContent className="p-0">
            {categories.length === 0 ? (
              <div className="p-8 text-center">
                <FolderTree className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary">No hay categorías creadas aún.</p>
                <p className="text-xs text-text-muted mt-1">
                  Ejecutá el seed para cargar datos iniciales: <code className="bg-surface-secondary px-1 rounded">npm run db:seed</code>
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-text-muted uppercase bg-surface-secondary">
                  <div className="col-span-1">Orden</div>
                  <div className="col-span-3">Nombre</div>
                  <div className="col-span-3">Slug</div>
                  <div className="col-span-2">Artículos</div>
                  <div className="col-span-2">Color</div>
                  <div className="col-span-1">Acciones</div>
                </div>
                {categories.map((cat) => (
                  <div key={cat.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-surface-secondary/50 transition-colors">
                    <div className="col-span-1">
                      <span className="text-sm font-mono text-text-muted">{cat.order}</span>
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-2">
                        {cat.color && (
                          <div 
                            className="w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        <span className="text-sm font-medium text-text-primary dark:text-white">
                          {cat.name}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <code className="text-xs text-text-muted bg-surface-secondary px-1.5 py-0.5 rounded">
                        {cat.slug}
                      </code>
                    </div>
                    <div className="col-span-2">
                      <Badge variant="default" size="sm">
                        <FileText className="w-3 h-3 mr-1" />
                        {(cat as any)._count?.articles ?? 0} artículos
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      {cat.color ? (
                        <code className="text-xs text-text-muted">{cat.color}</code>
                      ) : (
                        <span className="text-xs text-text-muted italic">Sin color</span>
                      )}
                    </div>
                    <div className="col-span-1">
                      <span className="text-xs text-text-muted italic">—</span>
                    </div>
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
              <strong>Nota:</strong> La edición de categorías estará disponible próximamente. 
              Actualmente se pueden gestionar desde la base de datos o mediante el seed.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
