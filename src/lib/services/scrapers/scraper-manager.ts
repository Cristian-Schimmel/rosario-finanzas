/**
 * Scraper Manager
 * Orchestrates all news scrapers and manages caching
 */

import { RSSScraper, RSS_FEEDS } from './rss-scraper';
import { cache } from '../cache';
import type { ScrapedArticle, ScrapeResult } from './types';

const CACHE_KEY = 'scraped:news:all';
const CACHE_TTL = 15 * 60; // 15 minutes

class ScraperManager {
  private scrapers: RSSScraper[];

  constructor() {
    this.scrapers = RSS_FEEDS
      .filter(feed => feed.source.enabled)
      .map(feed => new RSSScraper(feed));
  }

  async fetchAllNews(): Promise<ScrapedArticle[]> {
    // Check cache first
    const cached = cache.get<ScrapedArticle[]>(CACHE_KEY);
    if (cached) {
      console.log('[ScraperManager] Returning cached news');
      return cached;
    }

    console.log('[ScraperManager] Fetching fresh news from sources...');

    // Fetch from all scrapers in parallel
    const results = await Promise.allSettled(
      this.scrapers.map(scraper => scraper.scrape())
    );

    // Collect all successful articles
    const allArticles: ScrapedArticle[] = [];

    results.forEach((result, index) => {
      const feed = RSS_FEEDS[index];
      if (result.status === 'fulfilled' && result.value.success) {
        allArticles.push(...result.value.articles);
        console.log(`[ScraperManager] ${feed?.source.name || 'Unknown'}: ${result.value.articles.length} articles`);
      } else if (result.status === 'rejected') {
        console.error(`[ScraperManager] Failed to scrape ${feed?.source.name || 'Unknown'}:`, result.reason);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        // Silent fail for feeds that return errors
      }
    });

    // Sort by priority first, then by date (newest first)
    allArticles.sort((a, b) => {
      // Priority takes precedence (higher priority first)
      const priorityDiff = (b.priority || 5) - (a.priority || 5);
      if (priorityDiff !== 0) return priorityDiff;
      // Then by date
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });

    // Remove duplicates (by title similarity)
    const uniqueArticles = this.removeDuplicates(allArticles);

    // Cache the results
    cache.set(CACHE_KEY, uniqueArticles, CACHE_TTL);

    console.log(`[ScraperManager] Total unique articles: ${uniqueArticles.length}`);
    return uniqueArticles;
  }

  private removeDuplicates(articles: ScrapedArticle[]): ScrapedArticle[] {
    const seen = new Map<string, ScrapedArticle>();

    for (const article of articles) {
      // Create a normalized key from title
      const key = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 50);

      // Keep the one with higher priority, or the first occurrence
      const existing = seen.get(key);
      if (!existing || (article.priority || 0) > (existing.priority || 0)) {
        seen.set(key, article);
      }
    }

    return Array.from(seen.values());
  }

  async getArticleBySlug(slug: string): Promise<ScrapedArticle | null> {
    const articles = await this.fetchAllNews();
    return articles.find(a => this.generateSlug(a.title) === slug) || null;
  }

  async getArticleById(id: string): Promise<ScrapedArticle | null> {
    const articles = await this.fetchAllNews();
    return articles.find(a => a.id === id) || null;
  }

  async getArticlesByCategory(category: string, limit = 10): Promise<ScrapedArticle[]> {
    const articles = await this.fetchAllNews();
    return articles
      .filter(a => a.category.toLowerCase() === category.toLowerCase())
      .slice(0, limit);
  }

  /**
   * Get top priority articles (Rosario/Agro focus)
   */
  async getTopPriorityArticles(limit = 5): Promise<ScrapedArticle[]> {
    const articles = await this.fetchAllNews();
    return articles
      .filter(a => (a.priority || 0) >= 10) // High priority only
      .slice(0, limit);
  }

  /**
   * Get articles by region/category focus
   */
  async getAgroArticles(limit = 10): Promise<ScrapedArticle[]> {
    const articles = await this.fetchAllNews();
    return articles
      .filter(a => a.category === 'Agro' || a.source.category === 'agro')
      .slice(0, limit);
  }

  async getRosarioArticles(limit = 10): Promise<ScrapedArticle[]> {
    const articles = await this.fetchAllNews();
    return articles
      .filter(a => a.category === 'Rosario' || a.source.category === 'regional')
      .slice(0, limit);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 100);
  }

  // Force refresh cache
  invalidateCache(): void {
    cache.delete(CACHE_KEY);
  }
}

// Singleton instance
export const scraperManager = new ScraperManager();
