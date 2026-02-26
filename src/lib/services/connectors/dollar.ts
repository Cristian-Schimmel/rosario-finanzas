/**
 * Dollar Connector
 * Fetches USD quotes from multiple sources with fallback
 */

import { API_CONFIG } from '../api-config';
import { cache, rateLimiter } from '../cache';
import type { DollarQuote, DollarType, IndicatorSource } from '@/types';

interface DolarApiResponse {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

interface DollarFetchResult {
  quotes: DollarQuote[];
  source: IndicatorSource;
  lastUpdated: string;
  isFallback: boolean;
  disclaimer?: string;
}

// Fetch all dollar quotes
export async function fetchDollarQuotes(): Promise<DollarFetchResult> {
  const cacheKey = 'dollar:all';
  const cached = cache.get<DollarFetchResult>(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Check rate limit
  if (!rateLimiter.canProceed('dolarApi', API_CONFIG.dolarApi.rateLimit)) {
    throw new Error('Rate limit exceeded for dollar API');
  }

  try {
    const response = await fetch(`${API_CONFIG.dolarApi.baseUrl}${API_CONFIG.dolarApi.endpoints.dolares}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: DolarApiResponse[] = await response.json();
    
    const quotes: DollarQuote[] = data.map((item) => ({
      type: mapCasaToType(item.casa),
      name: item.nombre,
      buy: item.compra || 0,
      sell: item.venta || 0,
      spread: item.venta && item.compra ? ((item.venta - item.compra) / item.compra) * 100 : 0,
      change: 0, // Would need historical data
      changePercent: 0,
      lastUpdated: item.fechaActualizacion,
      source: 'ambito' as IndicatorSource,
    }));

    const result: DollarFetchResult = {
      quotes,
      source: 'ambito',
      lastUpdated: new Date().toISOString(),
      isFallback: true,
      disclaimer: API_CONFIG.dolarApi.disclaimer,
    };

    cache.set(cacheKey, result, API_CONFIG.dolarApi.cacheTTL);
    return result;

  } catch (error) {
    console.error('Error fetching dollar quotes:', error);
    
    // Return fallback data
    return getFallbackDollarData();
  }
}

// Fetch specific dollar type
export async function fetchDollarByType(type: DollarType): Promise<DollarQuote | null> {
  const cacheKey = `dollar:${type}`;
  const cached = cache.get<DollarQuote>(cacheKey);
  
  if (cached) {
    return cached;
  }

  const endpoint = {
    blue: API_CONFIG.dolarApi.endpoints.blue,
    oficial: API_CONFIG.dolarApi.endpoints.oficial,
    mep: API_CONFIG.dolarApi.endpoints.mep,
    ccl: API_CONFIG.dolarApi.endpoints.ccl,
    cripto: API_CONFIG.dolarApi.endpoints.cripto,
    mayorista: API_CONFIG.dolarApi.endpoints.mayorista,
    turista: API_CONFIG.dolarApi.endpoints.oficial, // Turista = Oficial * 1.6
  }[type];

  if (!endpoint) {
    return null;
  }

  try {
    const response = await fetch(`${API_CONFIG.dolarApi.baseUrl}${endpoint}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data: DolarApiResponse = await response.json();
    
    const quote: DollarQuote = {
      type,
      name: data.nombre,
      buy: data.compra || 0,
      sell: data.venta || 0,
      spread: data.venta && data.compra ? ((data.venta - data.compra) / data.compra) * 100 : 0,
      change: 0,
      changePercent: 0,
      lastUpdated: data.fechaActualizacion,
      source: 'ambito',
    };

    cache.set(cacheKey, quote, API_CONFIG.dolarApi.cacheTTL);
    return quote;

  } catch (error) {
    console.error(`Error fetching ${type} dollar:`, error);
    return null;
  }
}

// Map API casa to our DollarType
function mapCasaToType(casa: string): DollarType {
  const mapping: Record<string, DollarType> = {
    blue: 'blue',
    oficial: 'oficial',
    bolsa: 'mep',
    contadoconliqui: 'ccl',
    cripto: 'cripto',
    mayorista: 'mayorista',
    tarjeta: 'turista',
  };
  return mapping[casa.toLowerCase()] || 'oficial';
}

// Fallback data when API fails
function getFallbackDollarData(): DollarFetchResult {
  const now = new Date().toISOString();
  
  return {
    quotes: [
      {
        type: 'oficial',
        name: 'Dólar Oficial',
        buy: 1020,
        sell: 1025,
        spread: 0.49,
        change: 0,
        changePercent: 0,
        lastUpdated: now,
        source: 'fallback',
      },
      {
        type: 'blue',
        name: 'Dólar Blue',
        buy: 1175,
        sell: 1185,
        spread: 0.85,
        change: 0,
        changePercent: 0,
        lastUpdated: now,
        source: 'fallback',
      },
      {
        type: 'mep',
        name: 'Dólar MEP',
        buy: 1140,
        sell: 1145,
        spread: 0.44,
        change: 0,
        changePercent: 0,
        lastUpdated: now,
        source: 'fallback',
      },
      {
        type: 'ccl',
        name: 'Dólar CCL',
        buy: 1160,
        sell: 1170,
        spread: 0.86,
        change: 0,
        changePercent: 0,
        lastUpdated: now,
        source: 'fallback',
      },
    ],
    source: 'fallback',
    lastUpdated: now,
    isFallback: true,
    disclaimer: 'Datos de respaldo. No se pudieron obtener cotizaciones en tiempo real.',
  };
}

// Calculate spreads and gaps
export function calculateDollarMetrics(quotes: DollarQuote[]) {
  const oficial = quotes.find(q => q.type === 'oficial');
  const blue = quotes.find(q => q.type === 'blue');
  const mep = quotes.find(q => q.type === 'mep');
  const ccl = quotes.find(q => q.type === 'ccl');

  return {
    brechaBlue: oficial && blue 
      ? ((blue.sell - oficial.sell) / oficial.sell) * 100 
      : null,
    brechaMep: oficial && mep 
      ? ((mep.sell - oficial.sell) / oficial.sell) * 100 
      : null,
    brechaCcl: oficial && ccl 
      ? ((ccl.sell - oficial.sell) / oficial.sell) * 100 
      : null,
    spreadBlue: blue?.spread || null,
    spreadMep: mep?.spread || null,
  };
}
