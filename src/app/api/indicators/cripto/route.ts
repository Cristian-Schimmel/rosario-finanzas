import { NextResponse } from 'next/server';
import { fetchCryptoPrices } from '@/lib/services/connectors/crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 120;

export async function GET() {
  try {
    const result = await fetchCryptoPrices();
    
    return NextResponse.json({
      success: true,
      data: result.indicators,
      meta: {
        lastUpdated: result.lastUpdated,
        source: result.source,
      },
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener precios de criptomonedas',
      },
      { status: 500 }
    );
  }
}
