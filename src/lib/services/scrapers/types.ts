/**
 * Types for News Scraping System
 */

export interface NewsSource {
  id: string;
  name: string;
  baseUrl: string;
  logoUrl?: string;
  category: 'economia' | 'mercados' | 'agro' | 'finanzas' | 'cripto' | 'internacional' | 'regional';
  enabled: boolean;
}

export interface ScrapedArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  url: string;
  imageUrl?: string;
  source: NewsSource;
  category: string;
  publishedAt: Date;
  scrapedAt: Date;
  // Priority score (higher = more important)
  priority?: number;
  // AI-generated content
  aiSummary?: string;
  aiImageUrl?: string;
  aiKeyPoints?: string[];
}

export interface ScrapeResult {
  success: boolean;
  articles: ScrapedArticle[];
  error?: string;
  scrapedAt: Date;
}

// News sources configuration
export const NEWS_SOURCES: NewsSource[] = [
  {
    id: 'ambito',
    name: 'Ámbito Financiero',
    baseUrl: 'https://www.ambito.com',
    logoUrl: '/sources/ambito.png',
    category: 'economia',
    enabled: true,
  },
  {
    id: 'infobae',
    name: 'Infobae Economía',
    baseUrl: 'https://www.infobae.com',
    logoUrl: '/sources/infobae.png',
    category: 'economia',
    enabled: true,
  },
  {
    id: 'cronista',
    name: 'El Cronista',
    baseUrl: 'https://www.cronista.com',
    logoUrl: '/sources/cronista.png',
    category: 'finanzas',
    enabled: true,
  },
  {
    id: 'iprofesional',
    name: 'iProfesional',
    baseUrl: 'https://www.iprofesional.com',
    logoUrl: '/sources/iprofesional.png',
    category: 'finanzas',
    enabled: true,
  },
  {
    id: 'agrofy',
    name: 'Agrofy News',
    baseUrl: 'https://news.agrofy.com.ar',
    logoUrl: '/sources/agrofy.png',
    category: 'agro',
    enabled: true,
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  economia: 'Economía',
  mercados: 'Mercados',
  agro: 'Agro',
  finanzas: 'Finanzas',
  cripto: 'Cripto',
  internacional: 'Internacional',
};
