import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
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
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    const withError = allArticles.filter(a => a.processingError !== null);
    const withoutError = allArticles.filter(a => a.processingError === null);
    const aiRejected = allArticles.filter(a => a.processingError?.startsWith('AI Rejected'));

    return NextResponse.json({
      total: allArticles.length,
      withError: withError.length,
      withoutError: withoutError.length,
      aiRejected: aiRejected.length,
      sample: allArticles.slice(0, 10).map(a => ({
        title: a.title.slice(0, 60),
        source: a.sourceId,
        category: a.category,
        isProcessed: a.isProcessed,
        processingError: a.processingError?.slice(0, 80) ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
