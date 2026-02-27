import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/services/cache';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const stats = cache.getStats();
  const dbDebug = request.nextUrl.searchParams.get('db') === 'true';
  
  const health: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.1',
    cache: stats,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  if (dbDebug) {
    try {
      const allArticles = await prisma.processedNewsArticle.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          sourceName: true,
          sourceId: true,
          isProcessed: true,
          processingError: true,
        },
        orderBy: { publishedAt: 'desc' },
      });
      
      health.dbArticles = {
        total: allArticles.length,
        withError: allArticles.filter(a => a.processingError !== null).length,
        withoutError: allArticles.filter(a => a.processingError === null).length,
        aiRejected: allArticles.filter(a => a.processingError?.startsWith('AI Rejected')).length,
        isProcessedTrue: allArticles.filter(a => a.isProcessed).length,
        isProcessedFalse: allArticles.filter(a => !a.isProcessed).length,
        sample: allArticles.slice(0, 5).map(a => ({
          title: a.title.slice(0, 60),
          source: a.sourceId,
          category: a.category,
          isProcessed: a.isProcessed,
          processingError: a.processingError?.slice(0, 80) ?? null,
        })),
      };
    } catch (e) {
      health.dbError = String(e);
    }
  }

  return NextResponse.json(health);
}
