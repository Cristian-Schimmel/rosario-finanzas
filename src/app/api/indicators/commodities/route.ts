import { NextResponse } from 'next/server';
import { fetchAgroCommodities, fetchCommodities } from '@/lib/services/connectors/commodities';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  try {
    const result = await fetchCommodities();
    const agro = await fetchAgroCommodities();
    
    return NextResponse.json({
      success: true,
      data: {
        all: result.indicators,
        agro,
      },
      meta: {
        lastUpdated: result.lastUpdated,
        source: result.source,
        isFallback: result.isFallback,
        disclaimer: result.disclaimer,
      },
    });
  } catch (error) {
    console.error('Error fetching commodities:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener precios de commodities',
      },
      { status: 500 }
    );
  }
}
