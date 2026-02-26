/**
 * API Configuration for data sources
 * Prioritized by reliability and official status
 */

export const API_CONFIG = {
  // BCRA - Banco Central (Official)
  bcra: {
    baseUrl: 'https://api.bcra.gob.ar',
    endpoints: {
      principalesVariables: '/estadisticas/v2.0/principalesvariables',
      datosDiarios: '/estadisticas/v2.0/datosdiarios',
    },
    rateLimit: 10, // requests per minute
    cacheTTL: 60 * 5, // 5 minutes
  },

  // Datos Argentina - Series de Tiempo (Official)
  datosGob: {
    baseUrl: 'https://apis.datos.gob.ar/series/api',
    endpoints: {
      series: '/series',
    },
    // Key series IDs
    seriesIds: {
      inflacion: '148.3_INUCLEam_0_M_35', // IPC INDEC
      tasaBadlar: '168.1_T_BADLAM_0_0_21', // Tasa BADLAR
      reservas: '74.1_RIAM_0_0_31', // Reservas internacionales
      baseMonetaria: '74.1_BMI_0_0_21', // Base monetaria
      tipoCambioOficial: '168.1_T_CAMBIOR_0_0_26', // Tipo de cambio oficial
    },
    rateLimit: 20,
    cacheTTL: 60 * 15, // 15 minutes
  },

  // Dolar APIs (Unofficial - fallback)
  dolarApi: {
    baseUrl: 'https://dolarapi.com/v1',
    endpoints: {
      dolares: '/dolares',
      blue: '/dolares/blue',
      oficial: '/dolares/oficial',
      mep: '/dolares/bolsa',
      ccl: '/dolares/contadoconliqui',
      cripto: '/dolares/cripto',
      mayorista: '/dolares/mayorista',
    },
    rateLimit: 30,
    cacheTTL: 60 * 1, // 1 minute
    isFallback: true,
    disclaimer: 'Datos de fuente no oficial. Pueden diferir de cotizaciones reales.',
  },

  // Alternative Dolar API
  ambito: {
    baseUrl: 'https://mercados.ambito.com/dolar',
    endpoints: {
      blue: '/informal/variacion',
      oficial: '/oficial/variacion',
      mep: '/mep/variacion',
      ccl: '/cl/variacion',
    },
    rateLimit: 10,
    cacheTTL: 60 * 2,
    isFallback: true,
    disclaimer: 'Datos de Ámbito Financiero.',
  },

  // Crypto - CoinGecko
  coingecko: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    endpoints: {
      prices: '/simple/price',
      markets: '/coins/markets',
    },
    rateLimit: 10,
    cacheTTL: 60 * 2, // 2 minutes
  },

  // Commodities - via proxy/fallback
  commodities: {
    // Using Yahoo Finance data (would need a proxy in production)
    symbols: {
      soja: 'ZS=F',
      maiz: 'ZC=F',
      trigo: 'ZW=F',
      petroleo: 'CL=F',
      oro: 'GC=F',
    },
    cacheTTL: 60 * 5,
  },

  // RAVA Bursátil (for Merval, Riesgo País)
  rava: {
    baseUrl: 'https://clasico.rava.com/lib/restapi/v3',
    endpoints: {
      riesgoPais: '/publico/riesgo-pais',
    },
    cacheTTL: 60 * 5,
    isFallback: true,
  },

  // ArgentinaDatos API - Backup gratuito sin auth
  argentinaDatos: {
    baseUrl: 'https://api.argentinadatos.com',
    endpoints: {
      inflacionMensual: '/v1/finanzas/indices/inflacion',
      inflacionInteranual: '/v1/finanzas/indices/inflacion-interanual',
      uva: '/v1/finanzas/indices/uva',
      riesgoPais: '/v1/finanzas/indices/riesgo-pais',
      riesgoPaisUltimo: '/v1/finanzas/indices/riesgo-pais/ultimo',
      dolares: '/v1/cotizaciones/dolares',
      feriados: '/v1/feriados',
    },
    rateLimit: 60, // Sin límite estricto, pero moderamos
    cacheTTL: 60 * 5, // 5 minutes
    isBackup: true,
    disclaimer: 'Datos de ArgentinaDatos.com (fuentes: BCRA, INDEC, CAFCI).',
  },
} as const;

// BCRA Principal Variables IDs
export const BCRA_VARIABLE_IDS = {
  reservasInternacionales: 1,
  baseMonetaria: 15,
  tasaPoliticaMonetaria: 6,
  uva: 31,
  cer: 32,
  inflacionMensual: 27,
  inflacionInteranual: 28,
  tipoCambioMinorista: 4,
  tipoCambioMayorista: 5,
  badlarPrivados: 7,
  tasaPlazos: 8,
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

// Cache configuration
export const CACHE_CONFIG = {
  // Default TTLs by data type
  ttl: {
    realtime: 60, // 1 minute
    hourly: 60 * 60, // 1 hour
    daily: 60 * 60 * 24, // 24 hours
    weekly: 60 * 60 * 24 * 7,
  },
  // Max cache size (entries)
  maxSize: 1000,
};

export type ApiSourceId = keyof typeof API_CONFIG;
