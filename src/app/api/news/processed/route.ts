/**
 * API Route: Processed News
 * GET - Get all processed news from store (auto-refreshes if stale)
 * POST - Trigger news processing (with optional force refresh)
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getProcessedNews, 
  processAllNews, 
  getProcessingStatus,
  forceReprocess,
  isStoreStale 
} from '@/lib/services/news-processor';

// Track if a background refresh is already in progress
let isRefreshing = false;

/**
 * Trigger background news processing without blocking the response
 */
async function triggerBackgroundRefresh(): Promise<void> {
  if (isRefreshing) {
    console.log('[API] Background refresh already in progress, skipping');
    return;
  }
  
  isRefreshing = true;
  console.log('[API] Triggering background news refresh (data is stale)...');
  
  try {
    const result = await processAllNews();
    console.log(`[API] Background refresh completed: ${result.processedCount} articles in ${result.duration}ms`);
  } catch (error) {
    console.error('[API] Background refresh failed:', error);
  } finally {
    isRefreshing = false;
  }
}

// GET: Retrieve processed news
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '30');
    const category = searchParams.get('category');
    const status = searchParams.get('status') === 'true';
    const refresh = searchParams.get('refresh') === 'true';

    // If status requested, return processing status
    if (status) {
      const processingStatus = await getProcessingStatus();
      return NextResponse.json(processingStatus);
    }

    // Check if data is stale and trigger background refresh
    const staleCheck = await isStoreStale();
    if (staleCheck.stale || refresh) {
      console.log(`[API] News data is ${staleCheck.minutesOld} minutes old (last: ${staleCheck.lastUpdated}). Triggering refresh...`);
      // Don't await - let it run in background while we return current data
      triggerBackgroundRefresh();
    }

    // Get processed news (return current data immediately, even if stale)
    let articles = await getProcessedNews();

    // Filter by category if specified
    if (category) {
      articles = articles.filter(
        a => a.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Limit results
    articles = articles.slice(0, limit);

    return NextResponse.json({
      success: true,
      count: articles.length,
      staleMinutes: staleCheck.minutesOld,
      isRefreshing,
      lastUpdated: staleCheck.lastUpdated,
      articles,
    });
  } catch (error) {
    console.error('[API] Error fetching processed news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST: Trigger news processing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    console.log(`[API] Starting news processing (force: ${force})...`);

    // Process news
    const result = force 
      ? await forceReprocess()
      : await processAllNews();

    return NextResponse.json({
      success: result.success,
      message: `Processed ${result.processedCount} articles in ${result.duration}ms`,
      result,
    });
  } catch (error) {
    console.error('[API] Error processing news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process news' },
      { status: 500 }
    );
  }
}
