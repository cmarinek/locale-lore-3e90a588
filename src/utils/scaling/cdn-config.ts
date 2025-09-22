// CDN and edge caching configuration for global scale
interface CDNConfig {
  origin: string;
  edges: string[];
  cacheRules: CacheRule[];
  compression: CompressionConfig;
}

interface CacheRule {
  pattern: string;
  ttl: number;
  vary: string[];
  staleWhileRevalidate?: number;
}

interface CompressionConfig {
  enabled: boolean;
  level: number;
  types: string[];
}

export const CDN_CONFIGS: Record<string, CDNConfig> = {
  production: {
    origin: 'https://mwufulzthoqrwbwtvogx.supabase.co',
    edges: [
      'https://cdn-us-east.yourdomain.com',
      'https://cdn-eu-west.yourdomain.com',
      'https://cdn-asia-pacific.yourdomain.com'
    ],
    cacheRules: [
      {
        pattern: '/storage/v1/object/public/images/*',
        ttl: 86400, // 24 hours
        vary: ['Accept-Encoding', 'Accept'],
        staleWhileRevalidate: 3600
      },
      {
        pattern: '/rest/v1/facts*',
        ttl: 300, // 5 minutes
        vary: ['Authorization', 'Range'],
        staleWhileRevalidate: 60
      },
      {
        pattern: '/functions/v1/get-mapbox-token',
        ttl: 3600, // 1 hour
        vary: ['Authorization']
      }
    ],
    compression: {
      enabled: true,
      level: 6,
      types: ['application/json', 'text/plain', 'application/javascript', 'text/css']
    }
  }
};

export class CDNManager {
  private config: CDNConfig;
  private cache: Map<string, { data: any; expires: number }> = new Map();

  constructor(environment: string = 'production') {
    this.config = CDN_CONFIGS[environment];
  }

  // Get optimal edge server based on user location
  getOptimalEdge(userLat?: number, userLon?: number): string {
    if (!userLat || !userLon) {
      return this.config.origin; // Fallback to origin
    }

    // Simple geographic routing logic
    if (userLat > 45 && userLon > 0) {
      return this.config.edges[1] || this.config.origin; // EU
    } else if (userLat > 0 && userLon > 90) {
      return this.config.edges[2] || this.config.origin; // APAC
    } else {
      return this.config.edges[0] || this.config.origin; // US
    }
  }

  // Generate cache headers based on URL pattern
  getCacheHeaders(url: string): Record<string, string> {
    const rule = this.config.cacheRules.find(rule => 
      new RegExp(rule.pattern).test(url)
    );

    if (!rule) {
      return {
        'Cache-Control': 'no-cache'
      };
    }

    const headers: Record<string, string> = {
      'Cache-Control': `public, max-age=${rule.ttl}`,
      'Vary': rule.vary.join(', ')
    };

    if (rule.staleWhileRevalidate) {
      headers['Cache-Control'] += `, stale-while-revalidate=${rule.staleWhileRevalidate}`;
    }

    return headers;
  }

  // Client-side cache for API responses
  async getCachedResponse<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && cached.expires > now) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expires: now + ttl * 1000
    });

    return data;
  }

  // Preload critical resources
  preloadCriticalResources(resources: string[]): void {
    resources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      if (url.includes('.js')) {
        link.as = 'script';
      } else if (url.includes('.css')) {
        link.as = 'style';
      } else if (url.match(/\.(jpg|jpeg|png|webp|svg)$/)) {
        link.as = 'image';
      }

      document.head.appendChild(link);
    });
  }

  // Cleanup expired cache entries
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }
  }
}

export const cdnManager = new CDNManager();

// Critical resource preloading
export const CRITICAL_RESOURCES = [
  '/api/mapbox-token',
  '/storage/v1/object/public/icons/marker.svg',
  '/storage/v1/object/public/icons/cluster.svg'
];

// Auto-cleanup cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => cdnManager.cleanupCache(), 300000);
}