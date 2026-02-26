import { NextResponse } from 'next/server';
import { getMarketOverview } from '@/lib/services/indicator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every minute

export async function GET() {
  try {
    const overview = await getMarketOverview();
    
    return NextResponse.json({
      success: true,
      data: overview,
      meta: {
        lastUpdated: overview.lastUpdated,
        cached: true,
      },
    });
  } catch (error) {
    console.error('Error fetching market overview:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener datos del mercado',
      },
      { status: 500 }
    );
  }
}
