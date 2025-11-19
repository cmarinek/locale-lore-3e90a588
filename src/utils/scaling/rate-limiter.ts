
// Advanced rate limiting and DDoS protection
export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  blockDuration?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class AdvancedRateLimiter {
  private rules: Map<string, RateLimitRule> = new Map();
  private requests: Map<string, Array<{ timestamp: number; success: boolean }>> = new Map();
  private blockedUntil: Map<string, number> = new Map();

  constructor() {
    // Default rules
    this.addRule('api_general', { windowMs: 60000, maxRequests: 100 });
    this.addRule('api_search', { windowMs: 60000, maxRequests: 50 });
    this.addRule('api_submit', { windowMs: 300000, maxRequests: 10 });
    this.addRule('api_vote', { windowMs: 60000, maxRequests: 200 });
    this.addRule('api_comment', { windowMs: 60000, maxRequests: 30 });
    
    // Cleanup old requests every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  addRule(endpoint: string, rule: RateLimitRule): void {
    this.rules.set(endpoint, rule);
  }

  checkLimit(
    key: string,
    endpoint: string,
    success: boolean = true
  ): RateLimitResult {
    const rule = this.rules.get(endpoint);
    if (!rule) {
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }

    const now = Date.now();
    const identifier = `${endpoint}:${key}`;

    // Check if currently blocked
    const blockedUntil = this.blockedUntil.get(identifier);
    if (blockedUntil && now < blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockedUntil,
        retryAfter: Math.ceil((blockedUntil - now) / 1000)
      };
    }

    // Get or create request history
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const requestHistory = this.requests.get(identifier);
    const windowStart = now - rule.windowMs;

    // Filter requests in current window
    const relevantRequests = requestHistory.filter(req => {
      const isInWindow = req.timestamp > windowStart;
      const shouldCount = rule.skipSuccessfulRequests ? !req.success : 
                         rule.skipFailedRequests ? req.success : true;
      return isInWindow && shouldCount;
    });

    // Check if limit exceeded
    if (relevantRequests.length >= rule.maxRequests) {
      // Block if configured
      if (rule.blockDuration) {
        this.blockedUntil.set(identifier, now + rule.blockDuration);
      }

      const oldestRequest = Math.min(...relevantRequests.map(r => r.timestamp));
      const resetTime = oldestRequest + rule.windowMs;

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      };
    }

    // Add current request
    requestHistory.push({ timestamp: now, success });

    // Clean old requests
    this.requests.set(identifier, 
      requestHistory.filter(req => req.timestamp > windowStart)
    );

    return {
      allowed: true,
      remaining: rule.maxRequests - relevantRequests.length - 1,
      resetTime: windowStart + rule.windowMs
    };
  }

  // DDoS detection based on request patterns
  detectDDoSPattern(key: string): boolean {
    const identifier = `ddos:${key}`;
    const now = Date.now();
    const windowMs = 10000; // 10 seconds
    const suspiciousThreshold = 100; // requests per 10 seconds

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const requestHistory = this.requests.get(identifier);
    const recentRequests = requestHistory.filter(
      req => req.timestamp > now - windowMs
    );

    // Check for suspicious patterns
    const isHighVolume = recentRequests.length > suspiciousThreshold;
    const isRegularInterval = this.detectRegularInterval(recentRequests);
    const isSameUserAgent = this.detectSameUserAgent(key);

    return isHighVolume && (isRegularInterval || isSameUserAgent);
  }

  private detectRegularInterval(requests: Array<{ timestamp: number; success: boolean }>): boolean {
    if (requests.length < 10) return false;

    const intervals = [];
    for (let i = 1; i < requests.length; i++) {
      intervals.push(requests[i].timestamp - requests[i - 1].timestamp);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => 
      sum + Math.pow(interval - avgInterval, 2), 0
    ) / intervals.length;

    // Low variance indicates regular intervals (bot-like behavior)
    return variance < 1000; // 1 second variance threshold
  }

  private detectSameUserAgent(key: string): boolean {
    // This would check if all requests from this key have the same user agent
    // Implementation would depend on how user agent is tracked
    return false; // Placeholder
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1 hour

    // Clean request history
    for (const [key, requests] of this.requests) {
      const filtered = requests.filter(req => req.timestamp > now - maxAge);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }

    // Clean expired blocks
    for (const [key, blockedUntil] of this.blockedUntil) {
      if (now > blockedUntil) {
        this.blockedUntil.delete(key);
      }
    }
  }

  getStats() {
    return {
      totalKeys: this.requests.size,
      blockedKeys: this.blockedUntil.size,
      rules: Array.from(this.rules.keys())
    };
  }
}

export const rateLimiter = new AdvancedRateLimiter();
