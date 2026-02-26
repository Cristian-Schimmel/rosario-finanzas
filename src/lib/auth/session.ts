import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/admin/login');
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== 'ADMIN') {
    redirect('/admin?error=unauthorized');
  }

  return user;
}

export async function requireEditor() {
  const user = await requireAuth();

  if (!['ADMIN', 'EDITOR'].includes(user.role)) {
    redirect('/admin?error=unauthorized');
  }

  return user;
}

export function isAdmin(role: string) {
  return role === 'ADMIN';
}

export function isEditor(role: string) {
  return ['ADMIN', 'EDITOR'].includes(role);
}

export function canEdit(role: string) {
  return ['ADMIN', 'EDITOR'].includes(role);
}

export function canDelete(role: string) {
  return role === 'ADMIN';
}

export function canManageUsers(role: string) {
  return role === 'ADMIN';
}
