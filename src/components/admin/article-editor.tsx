'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/admin-layout';
import {
  Save,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Calendar,
  Tag,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface ArticleEditorProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'EDITOR' | 'VIEWER';
    avatar?: string | null;
  };
  article?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    coverImage: string | null;
    status: string;
    publishedAt: Date | null;
    categoryId: string | null;
    tags: { tag: { id: string; name: string; slug: string } }[];
  };
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
}

export function ArticleEditor({
  user,
  article,
  categories,
  tags,
}: ArticleEditorProps) {
  const router = useRouter();
  const isNew = !article;

  const [formData, setFormData] = useState({
    title: article?.title || '',
    slug: article?.slug || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    coverImage: article?.coverImage || '',
    categoryId: article?.categoryId || '',
    status: article?.status || 'DRAFT',
    publishedAt: article?.publishedAt
      ? new Date(article.publishedAt).toISOString().slice(0, 16)
      : '',
    tagIds: article?.tags.map((t) => t.tag.id) || [],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isNew
        ? title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        : prev.slug,
    }));
  };

  const handleSubmit = async (status?: string) => {
    setIsSaving(true);
    setErrors({});

    const data = {
      ...formData,
      status: status || formData.status,
      publishedAt:
        (status || formData.status) === 'PUBLISHED' && !formData.publishedAt
          ? new Date().toISOString()
          : formData.publishedAt || null,
    };

    try {
      const response = await fetch(
        `/api/admin/articles${isNew ? '' : `/${article.id}`}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setErrors(error.errors || { general: 'Error al guardar' });
        setIsSaving(false);
        return;
      }

      const result = await response.json();
      router.push('/admin/articulos');
      router.refresh();
    } catch (error) {
      setErrors({ general: 'Error de conexión' });
      setIsSaving(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  return (
    <AdminLayout user={user}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/articulos"
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-text-muted" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {isNew ? 'Nuevo Artículo' : 'Editar Artículo'}
              </h1>
              {!isNew && (
                <p className="text-text-muted text-sm">ID: {article.id}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isNew && (
              <Link
                href={`/noticias/${article.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-surface-secondary transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver
              </Link>
            )}
            <Button
              onClick={() => handleSubmit('DRAFT')}
              variant="outline"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar Borrador
            </Button>
            <Button
              onClick={() => handleSubmit('PUBLISHED')}
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Publicar
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="mb-4 p-4 bg-down-subtle text-down rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Título *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Título del artículo"
                    className="text-lg font-medium"
                  />
                  {errors.title && (
                    <p className="text-down text-sm mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Slug
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    placeholder="url-del-articulo"
                    className="font-mono text-sm"
                  />
                  {errors.slug && (
                    <p className="text-down text-sm mt-1">{errors.slug}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader title="Resumen" />
              <CardContent className="p-4 pt-0">
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  placeholder="Breve descripción del artículo..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input-border bg-input-bg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader title="Contenido" />
              <CardContent className="p-4 pt-0">
                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="Escribe el contenido del artículo aquí... (Markdown soportado)"
                  rows={20}
                  className="w-full px-3 py-2 rounded-lg border border-input-border bg-input-bg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none font-mono text-sm"
                />
                <p className="text-xs text-text-muted mt-2">
                  Tip: Puedes usar Markdown para dar formato al contenido.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader title="Estado" />
              <CardContent className="p-4 pt-0">
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-input-border bg-input-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="SCHEDULED">Programado</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>

                {formData.status === 'SCHEDULED' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Fecha de Publicación
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          publishedAt: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader title="Categoría" />
              <CardContent className="p-4 pt-0">
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-input-border bg-input-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader
                title="Imagen de Portada"
                icon={<ImageIcon className="w-4 h-4 text-accent" />}
              />
              <CardContent className="p-4 pt-0">
                <Input
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      coverImage: e.target.value,
                    }))
                  }
                  placeholder="https://..."
                />
                {formData.coverImage && (
                  <div className="mt-3 relative aspect-video rounded-lg overflow-hidden bg-surface-secondary">
                    <img
                      src={formData.coverImage}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader
                title="Tags"
                icon={<Tag className="w-4 h-4 text-accent" />}
              />
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.tagIds.includes(tag.id)
                          ? 'bg-accent text-white'
                          : 'bg-surface-secondary text-text-secondary hover:bg-accent/10'
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
