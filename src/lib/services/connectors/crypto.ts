/**
 * Crypto Connector
 * Fetches cryptocurrency prices from CoinGecko
 */

import { API_CONFIG } from '../api-config';
import { cache, rateLimiter } from '../cache';
import type { Indicator, IndicatorSource } from '@/types';

interface CoinGeckoPrice {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol?: number;
    usd_market_cap?: number;
  };
}

interface CryptoResult {
  indicators: Indicator[];
  source: IndicatorSource;
  lastUpdated: string;
}

const CRYPTO_IDS = ['bitcoin', 'ethereum', 'tether', 'solana', 'ripple'];
const CRYPTO_SYMBOLS: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  tether: 'USDT',
  solana: 'SOL',
  ripple: 'XRP',
};

// Fetch crypto prices
export async function fetchCryptoPrices(): Promise<CryptoResult> {
  const cacheKey = 'crypto:prices';
  const cached = cache.get<CryptoResult>(cacheKey);
  
  if (cached) {
    return cached;
  }

  // Check rate limit
  if (!rateLimiter.canProceed('coingecko', API_CONFIG.coingecko.rateLimit)) {
    console.warn('CoinGecko rate limit reached');
    return getFallbackCryptoData();
  }

  try {
    const ids = CRYPTO_IDS.join(',');
    const url = `${API_CONFIG.coingecko.baseUrl}${API_CONFIG.coingecko.endpoints.prices}?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`;
    
    const response = await fetch(url, {
      next: { revalidate: 120 }, // 2 minutes
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoPrice = await response.json();
    
    const indicators: Indicator[] = Object.entries(data).map(([id, values]) => ({
      id: `crypto-${id}`,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      shortName: CRYPTO_SYMBOLS[id] || id.toUpperCase(),
      category: 'cripto' as const,
      value: values.usd,
      previousValue: values.usd / (1 + values.usd_24h_change / 100),
      change: values.usd - (values.usd / (1 + values.usd_24h_change / 100)),
      changePercent: values.usd_24h_change,
      unit: 'USD',
      format: 'currency' as const,
      decimals: values.usd > 100 ? 0 : 2,
      source: 'binance' as IndicatorSource, // We use CoinGecko but display as common source
      lastUpdated: new Date().toISOString(),
      frequency: 'realtime' as const,
    }));

    const result: CryptoResult = {
      indicators,
      source: 'binance',
      lastUpdated: new Date().toISOString(),
    };

    cache.set(cacheKey, result, API_CONFIG.coingecko.cacheTTL);
    return result;

  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return getFallbackCryptoData();
  }
}

// Get specific crypto
export async function fetchCryptoBySymbol(symbol: string): Promise<Indicator | null> {
  const result = await fetchCryptoPrices();
  return result.indicators.find(
    (i) => i.shortName.toLowerCase() === symbol.toLowerCase()
  ) || null;
}

// Get BTC price
export async function getBitcoinPrice(): Promise<Indicator | null> {
  return fetchCryptoBySymbol('BTC');
}

// Get ETH price
export async function getEthereumPrice(): Promise<Indicator | null> {
  return fetchCryptoBySymbol('ETH');
}

// Fallback data
function getFallbackCryptoData(): CryptoResult {
  const now = new Date().toISOString();
  
  return {
    indicators: [
      {
        id: 'crypto-bitcoin',
        name: 'Bitcoin',
        shortName: 'BTC',
        category: 'cripto',
        value: 67500,
        previousValue: 66200,
        change: 1300,
        changePercent: 1.96,
        unit: 'USD',
        format: 'currency',
        decimals: 0,
        source: 'fallback',
        lastUpdated: now,
        frequency: 'realtime',
        isFallback: true,
        disclaimer: 'Precio estimado.',
      },
      {
        id: 'crypto-ethereum',
        name: 'Ethereum',
        shortName: 'ETH',
        category: 'cripto',
        value: 3450,
        previousValue: 3380,
        change: 70,
        changePercent: 2.07,
        unit: 'USD',
        format: 'currency',
        decimals: 0,
        source: 'fallback',
        lastUpdated: now,
        frequency: 'realtime',
        isFallback: true,
        disclaimer: 'Precio estimado.',
      },
    ],
    source: 'fallback',
    lastUpdated: now,
  };
}
