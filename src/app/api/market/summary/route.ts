/**
 * Market Summary API Route
 * Fetches real-time market data from BYMA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMarketSummary } from '@/lib/services/byma-service';

export const revalidate = 60; // Revalidate every minute

export async function GET(request: NextRequest) {
  try {
    const summary = await getMarketSummary();
    
    return NextResponse.json(summary, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Market summary API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error fetching market data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
