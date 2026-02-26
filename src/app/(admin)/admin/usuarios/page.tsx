import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Shield,
  Clock,
  Mail,
  UserCheck,
  UserX,
} from 'lucide-react';

export default async function AdminUsuariosPage() {
  const user = await requireAdmin(); // Only admins can manage users

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const roleLabels: Record<string, { label: string; variant: 'positive' | 'accent' | 'default' }> = {
    ADMIN: { label: 'Administrador', variant: 'accent' },
    EDITOR: { label: 'Editor', variant: 'positive' },
    VIEWER: { label: 'Lector', variant: 'default' },
  };

  return (
    <AdminLayout user={user as any}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary dark:text-white">Usuarios</h1>
            <p className="text-sm text-text-muted mt-1">
              Administrar usuarios del panel — Solo visible para administradores
            </p>
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium opacity-50 cursor-not-allowed">
            <Users className="w-4 h-4" />
            Nuevo Usuario
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">{users.length}</p>
              <p className="text-xs text-text-muted">Usuarios totales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">
                {users.filter(u => u.active).length}
              </p>
              <p className="text-xs text-text-muted">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">
                {users.filter(u => u.role === 'ADMIN').length}
              </p>
              <p className="text-xs text-text-muted">Administradores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-text-primary dark:text-white">
                {users.filter(u => u.role === 'EDITOR').length}
              </p>
              <p className="text-xs text-text-muted">Editores</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-text-muted uppercase bg-surface-secondary">
                <div className="col-span-3">Usuario</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Rol</div>
                <div className="col-span-1">Estado</div>
                <div className="col-span-1">Artículos</div>
                <div className="col-span-2">Último acceso</div>
              </div>
              {users.map((u) => {
                const roleInfo = roleLabels[u.role] || roleLabels.VIEWER;
                return (
                  <div key={u.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-surface-secondary/50 transition-colors">
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-accent">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary dark:text-white">
                            {u.name || 'Sin nombre'}
                          </p>
                          <p className="text-xs text-text-muted">
                            Creado {new Date(u.createdAt).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm text-text-secondary flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <Badge variant={roleInfo.variant} size="sm">
                        <Shield className="w-3 h-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                    </div>
                    <div className="col-span-1">
                      {u.active ? (
                        <Badge variant="positive" size="sm">
                          <UserCheck className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="negative" size="sm">
                          <UserX className="w-3 h-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-sm font-mono text-text-primary dark:text-white">
                        {(u as any)._count?.articles ?? 0}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {u.lastLoginAt 
                          ? new Date(u.lastLoginAt).toLocaleString('es-AR')
                          : 'Nunca'
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card variant="outlined" className="bg-surface-secondary/30">
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">
              <strong>Nota:</strong> La creación y edición de usuarios estará disponible próximamente. 
              Para crear usuarios, usá el seed o directamente la base de datos.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
