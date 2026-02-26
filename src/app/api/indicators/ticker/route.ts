import { NextResponse } from 'next/server';
import { getTickerData } from '@/lib/services/indicator-service';

export const revalidate = 60; // Revalidate every minute

export async function GET() {
  try {
    const tickerData = await getTickerData();
    
    return NextResponse.json(tickerData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching ticker data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 }
    );
  }
}
