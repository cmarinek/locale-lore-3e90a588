import Redis from 'ioredis';

export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number; // Estimated time when the limit will reset, in ms
}

export class AdvancedRateLimiter {
  private client: Redis | null = null;
  private rules: Map<string, RateLimitRule> = new Map();

  constructor() {
    if (process.env.REDIS_URL) {
      try {
        this.client = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          connectTimeout: 10000,
        });
        console.log("Rate Limiter successfully connected to Redis.");
      } catch (error) {
        console.error("Rate Limiter could not connect to Redis:", error);
        this.client = null;
      }
    } else {
      console.warn("REDIS_URL not found. Rate Limiter will not be operational.");
    }

    // Default rules can be configured here
    this.addRule('api_general', { windowMs: 60000, maxRequests: 100 });
    this.addRule('api_search', { windowMs: 60000, maxRequests: 50 });
    this.addRule('api_submit', { windowMs: 300000, maxRequests: 10 });
    this.addRule('api_vote', { windowMs: 60000, maxRequests: 200 });
    this.addRule('api_comment', { windowMs: 60000, maxRequests: 30 });
  }

  addRule(endpoint: string, rule: RateLimitRule): void {
    this.rules.set(endpoint, rule);
  }

  async checkLimit(key: string, endpoint: string): Promise<RateLimitResult> {
    // If Redis isn't configured, we fail open (allow the request).
    // In a real production scenario, you might want to fail closed depending on security requirements.
    if (!this.client) {
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }

    const rule = this.rules.get(endpoint);
    if (!rule) {
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }

    const now = Date.now();
    const identifier = `rate_limit:${endpoint}:${key}`;
    const windowStart = now - rule.windowMs;

    const pipeline = this.client.pipeline();

    // Use a unique member for each request to avoid score collisions in the sorted set
    const member = `${now}:${Math.random()}`;

    // 1. Remove all requests from the sorted set that are older than the window
    pipeline.zremrangebyscore(identifier, '-inf', windowStart);
    // 2. Add the current request's timestamp to the set
    pipeline.zadd(identifier, now, member);
    // 3. Count the total number of requests in the set (the new count)
    pipeline.zcard(identifier);
    // 4. Set the key to expire automatically after the window has passed
    pipeline.expire(identifier, Math.ceil(rule.windowMs / 1000));

    const results = await pipeline.exec();

    // The result of ZCARD is the 3rd command in the pipeline (index 2)
    // Format of pipeline result is [[error, result], [error, result], ...]
    const currentRequests = results && results[2] && !results[2][0] ? (results[2][1] as number) : 0;

    if (currentRequests > rule.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + rule.windowMs, // A simple estimation
      };
    }

    return {
      allowed: true,
      remaining: rule.maxRequests - currentRequests,
      resetTime: now + rule.windowMs, // A simple estimation
    };
  }

  disconnect(): void {
    if (!this.client) return;
    this.client.disconnect();
  }
}

export const rateLimiter = new AdvancedRateLimiter();
