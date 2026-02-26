/**
 * Base Scraper Class
 * Abstract class for news scrapers
 */

import type { NewsSource, ScrapedArticle, ScrapeResult } from './types';

export abstract class BaseScraper {
  protected source: NewsSource;
  protected userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  constructor(source: NewsSource) {
    this.source = source;
  }

  abstract scrape(): Promise<ScrapeResult>;

  protected async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  protected generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  }

  protected generateId(url: string): string {
    // Create a unique ID from URL
    const hash = url.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return `${this.source.id}-${Math.abs(hash).toString(36)}`;
  }

  protected extractImageFromHtml(html: string): string | undefined {
    // Try to find og:image first
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    if (ogImageMatch) return ogImageMatch[1];

    // Try twitter:image
    const twitterImageMatch = html.match(/<meta[^>]*name="twitter:image"[^>]*content="([^"]+)"/i);
    if (twitterImageMatch) return twitterImageMatch[1];

    return undefined;
  }

  protected cleanText(text: string): string {
    return text
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  protected parseDate(dateStr: string): Date {
    try {
      // Try various date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) return date;
      
      // If parsing fails, return current date
      return new Date();
    } catch {
      return new Date();
    }
  }
}
