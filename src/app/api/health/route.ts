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
    version: '1.6.0',
    cache: stats,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  if (dbDebug) {
    try {
      const total = await prisma.processedNewsArticle.count();
      const aiRejected = await prisma.processedNewsArticle.count({
        where: { processingError: { startsWith: 'AI Rejected' } },
      });
      health.dbArticles = { total, aiRejected, valid: total - aiRejected };
    } catch (e) {
      health.dbError = String(e);
    }
  }

  return NextResponse.json(health);
}
