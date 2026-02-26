/**
 * Historical Market Data API Route
 * Fetches historical data for market indices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIndexHistorical } from '@/lib/services/byma-service';

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'MERVAL';
    const period = (searchParams.get('period') || '1M') as '1D' | '1W' | '1M' | '3M' | '1Y' | 'YTD';

    // Validate parameters
    const validSymbols = ['MERVAL', 'GENERAL'];
    const validPeriods = ['1D', '1W', '1M', '3M', '1Y', 'YTD'];

    if (!validSymbols.includes(symbol)) {
      return NextResponse.json(
        { error: 'Invalid symbol. Use MERVAL or GENERAL' },
        { status: 400 }
      );
    }

    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period. Use 1D, 1W, 1M, 3M, 1Y, or YTD' },
        { status: 400 }
      );
    }

    const historical = await getIndexHistorical(symbol, period);
    
    // Set appropriate cache based on period
    const cacheDuration = period === '1D' ? 60 : period === '1W' ? 300 : 3600;
    
    return NextResponse.json(historical, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`,
      },
    });
  } catch (error) {
    console.error('Historical data API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error fetching historical data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
