/**
 * LRU Cache with aggressive caching strategy
 * Optimized for frequently accessed data like user profiles and categories
 */

interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // approximate size in bytes
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  maxSize: number;
  hitRate: number;
  entries: number;
}

export class LRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private maxAge: number;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
  };

  constructor(maxSize: number = 100, maxAge: number = 300000) {
    // maxAge default: 5 minutes
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * Set item in cache
   */
  set(key: string, value: T, size?: number): void {
    // If key exists, update it
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      entry.value = value;
      entry.timestamp = Date.now();
      entry.lastAccessed = Date.now();
      return;
    }

    // Check if we need to evict
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Add new entry
    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      size: size || this.estimateSize(value),
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all items
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    // First entry is the least recently used (oldest)
    const firstKey = this.cache.keys().next().value;
    if (firstKey) {
      this.cache.delete(firstKey);
      this.stats.evictions++;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      entries: this.cache.size,
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache entries sorted by access frequency
   */
  getHotEntries(limit: number = 10): Array<{ key: string; accessCount: number }> {
    return Array.from(this.cache.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit)
      .map((entry) => ({ key: entry.key, accessCount: entry.accessCount }));
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: any): number {
    const str = JSON.stringify(value);
    return str.length * 2; // Approximate bytes (UTF-16)
  }

  /**
   * Prune expired entries
   */
  pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
        pruned++;
      }
    }

    return pruned;
  }
}

// Pre-configured caches for common use cases
export const profileCache = new LRUCache<any>(150, 600000); // 10 minutes
export const categoryCache = new LRUCache<any>(50, 1800000); // 30 minutes
export const factCache = new LRUCache<any>(200, 300000); // 5 minutes

// Auto-prune expired entries every minute
setInterval(() => {
  profileCache.pruneExpired();
  categoryCache.pruneExpired();
  factCache.pruneExpired();
}, 60000);
