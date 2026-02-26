import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { invalidateNewsCache } from '@/lib/services/news-service';

// Debug endpoint to check articles in database
export async function GET(request: NextRequest) {
  try {
    // Invalidate cache to force refresh
    invalidateNewsCache();

    const articles = await prisma.article.findMany({
      include: {
        category: true,
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      totalArticles: articles.length,
      articles: articles.map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        status: a.status,
        category: a.category?.name || 'Sin categoría',
        categoryId: a.categoryId,
        coverImage: a.coverImage,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
        author: a.author?.name,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        articleCount: c._count.articles,
      })),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Error fetching data', details: String(error) },
      { status: 500 }
    );
  }
}
