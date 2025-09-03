import Redis from 'ioredis';

// A wrapper for storing objects with their tags for invalidation purposes.
interface CachePayload<T> {
  data: T;
  tags?: string[];
}

export class RedisCache {
  private client: Redis | null = null;
  private defaultTTL: number = 300; // 5 minutes in seconds for Redis

  constructor() {
    if (process.env.REDIS_URL) {
      try {
        this.client = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
        });
        console.log("Successfully connected to Redis.");
      } catch (error) {
        console.error("Could not connect to Redis:", error);
        this.client = null;
      }
    } else {
      console.warn("REDIS_URL not found. RedisCache will not be operational.");
    }
  }

  private getTagKey(tag: string): string {
    return `tag:${tag}`;
  }

  async set<T>(key: string, data: T, ttlInSeconds?: number, tags?: string[]): Promise<void> {
    if (!this.client) return;

    const payload: CachePayload<T> = { data, tags };
    const finalTTL = ttlInSeconds || this.defaultTTL;

    const pipeline = this.client.pipeline();
    pipeline.set(key, JSON.stringify(payload), 'EX', finalTTL);

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        pipeline.sadd(this.getTagKey(tag), key);
      }
    }

    await pipeline.exec();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client) return null;

    const result = await this.client.get(key);
    if (!result) return null;

    try {
      const payload: CachePayload<T> = JSON.parse(result);
      return payload.data;
    } catch (error) {
      console.error(`Error parsing JSON from Redis for key "${key}":`, error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client) return false;
    const result = await this.client.del(key);
    return result > 0;
  }

  async clearByTags(tags: string[]): Promise<void> {
    if (!this.client || tags.length === 0) return;

    const pipeline = this.client.pipeline();
    const tagKeys = tags.map(this.getTagKey);

    for (const tagKey of tagKeys) {
        const keysToDelete = await this.client.smembers(tagKey);
        if (keysToDelete.length > 0) {
            pipeline.del(...keysToDelete);
        }
        pipeline.del(tagKey); // Remove the tag set itself
    }

    await pipeline.exec();
  }

  async clear(): Promise<void> {
    if (!this.client) return;
    await this.client.flushdb();
  }

  async getStats() {
    if (!this.client) {
      return {
        connected: false,
        redis_version: null,
        used_memory_human: null,
        keyspace_keys: null,
      };
    }
    const info = await this.client.info();
    const db_keys = await this.client.dbsize();

    const getInfoValue = (field: string) => {
        const match = info.match(new RegExp(`^${field}:(.*)$`, 'm'));
        return match ? match[1].trim() : 'N/A';
    }

    return {
        connected: true,
        redis_version: getInfoValue('redis_version'),
        used_memory_human: getInfoValue('used_memory_human'),
        keyspace_keys: db_keys,
        uptime_in_days: getInfoValue('uptime_in_days'),
    };
  }

  disconnect(): void {
    if (!this.client) return;
    this.client.disconnect();
  }
}

// Hot data cache keys (remain unchanged)
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

// Cache tags for invalidation (remain unchanged)
export const CACHE_TAGS = {
  FACTS: 'facts',
  USERS: 'users',
  SEARCH: 'search',
  ANALYTICS: 'analytics',
  TRENDING: 'trending',
} as const;

export const cache = new RedisCache();
