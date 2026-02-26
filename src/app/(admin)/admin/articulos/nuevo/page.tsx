import { requireEditor } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { ArticleEditor } from '@/components/admin/article-editor';

export default async function NuevoArticuloPage() {
  const user = await requireEditor();

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.tag.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <ArticleEditor
      user={user}
      categories={categories}
      tags={tags}
    />
  );
}
