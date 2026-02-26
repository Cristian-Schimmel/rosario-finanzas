import { NextResponse } from 'next/server';
import { getDollarQuotes } from '@/lib/services/indicator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const { quotes, metrics } = await getDollarQuotes();
    
    return NextResponse.json({
      success: true,
      data: {
        quotes,
        metrics,
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        source: quotes[0]?.source || 'unknown',
      },
    });
  } catch (error) {
    console.error('Error fetching dollar quotes:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener cotizaciones del dólar',
      },
      { status: 500 }
    );
  }
}
