/**
 * Simple in-memory cache with TTL support
 * For production, replace with Redis or similar
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    // Evict oldest entries if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    this.cache.forEach((entry) => {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.maxSize,
    };
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    });

    return removed;
  }

  // Get time until expiry for a key
  getTTL(key: string): number | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const ttl = Math.max(0, entry.expiresAt - Date.now());
    return Math.floor(ttl / 1000);
  }

  // Get metadata about a cached entry
  getMeta(key: string): { createdAt: Date; expiresAt: Date; ttlRemaining: number } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    return {
      createdAt: new Date(entry.createdAt),
      expiresAt: new Date(entry.expiresAt),
      ttlRemaining: Math.max(0, Math.floor((entry.expiresAt - Date.now()) / 1000)),
    };
  }
}

// Singleton instance
export const cache = new MemoryCache();

// Decorator for caching function results
export function withCache<T>(
  fn: () => Promise<T>,
  key: string,
  ttlSeconds: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fn().then((result) => {
    cache.set(key, result, ttlSeconds);
    return result;
  });
}

// Rate limiter
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  canProceed(key: string, maxRequests: number, windowMs: number = 60000): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      this.limits.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (entry.count >= maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(key: string, maxRequests: number): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetAt) {
      return maxRequests;
    }
    return Math.max(0, maxRequests - entry.count);
  }

  getResetTime(key: string): number | null {
    const entry = this.limits.get(key);
    if (!entry) return null;
    return entry.resetAt;
  }
}

export const rateLimiter = new RateLimiter();
