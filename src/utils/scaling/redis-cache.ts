
// Redis caching layer for hot data
export interface CacheItem<T = any> {
  data: T;
  expiry: number;
  tags?: string[];
}

export class RedisCache {
  private cache: Map<string, CacheItem> = new Map();
  private defaultTTL: number = 300000; // 5 minutes
  private maxSize: number = 10000;

  constructor(maxSize: number = 10000, defaultTTL: number = 300000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Clean up expired items every minute
    setInterval(() => this.cleanup(), 60000);
  }

  // Set cache item
  set<T>(key: string, data: T, ttl?: number, tags?: string[]): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry, tags });
  }

  // Get cache item
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  // Delete cache item
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear cache by tags
  clearByTags(tags: string[]): void {
    for (const [key, item] of this.cache) {
      if (item.tags && item.tags.some(tag => tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiry) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize,
      hitRate: this.getHitRate()
    };
  }

  private hits = 0;
  private misses = 0;

  private getHitRate(): number {
    const total = this.hits + this.misses;
    return total > 0 ? this.hits / total : 0;
  }

  // Cleanup expired items
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, item] of this.cache) {
      if (now > item.expiry) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
  }

  // Evict least recently used items
  private evictLRU(): void {
    const keys = Array.from(this.cache.keys());
    const toEvict = keys.slice(0, Math.floor(this.maxSize * 0.1)); // Evict 10%
    toEvict.forEach(key => this.cache.delete(key));
  }
}

// Hot data cache keys
export const CACHE_KEYS = {
  TRENDING_FACTS: 'trending_facts',
  TRENDING_LOCATIONS: 'trending_locations',
  POPULAR_CATEGORIES: 'popular_categories',
  USER_RECOMMENDATIONS: (userId: string) => `user_recommendations:${userId}`,
  FACT_DETAILS: (factId: string) => `fact_details:${factId}`,
  SEARCH_RESULTS: (query: string, filters: string) => `search:${query}:${filters}`,
  USER_PROFILE: (userId: string) => `profile:${userId}`,
  LEADERBOARD: (type: string, period: string) => `leaderboard:${type}:${period}`,
} as const;

// Cache tags for invalidation
export const CACHE_TAGS = {
  FACTS: 'facts',
  USERS: 'users',
  SEARCH: 'search',
  ANALYTICS: 'analytics',
  TRENDING: 'trending',
} as const;

export const cache = new RedisCache();
