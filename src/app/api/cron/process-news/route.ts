/**
 * Cron Job: Process News
 * Runs every 30 minutes via Vercel Cron
 * Fetches RSS feeds, filters, summarizes with AI, and stores in DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { processAllNews } from '@/lib/services/news-processor';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds (Vercel Pro allows up to 300)

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (or allow in development)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Cron] Unauthorized cron request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] Starting scheduled news processing...');

  try {
    const result = await processAllNews();

    console.log(`[Cron] Completed: ${result.processedCount} articles in ${result.duration}ms`);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processedCount} articles in ${result.duration}ms`,
      result,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Cron] Fatal error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
