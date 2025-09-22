// Global Mapbox service for token management and map optimization
import { supabase } from '@/integrations/supabase/client';

interface MapboxTokenCache {
  token: string;
  timestamp: number;
  expiresAt: number;
}

class MapboxService {
  private static instance: MapboxService;
  private tokenCache: MapboxTokenCache | null = null;
  private tokenPromise: Promise<string | null> | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly STORAGE_KEY = 'mapbox_token_cache';

  private constructor() {
    this.loadCachedToken();
  }

  static getInstance(): MapboxService {
    if (!MapboxService.instance) {
      MapboxService.instance = new MapboxService();
    }
    return MapboxService.instance;
  }

  private loadCachedToken(): void {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (cached) {
        const data: MapboxTokenCache = JSON.parse(cached);
        if (Date.now() < data.expiresAt) {
          this.tokenCache = data;
          console.log('🗺️ Mapbox token loaded from cache');
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load cached Mapbox token:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private saveCachedToken(token: string): void {
    try {
      const cache: MapboxTokenCache = {
        token,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cache));
      this.tokenCache = cache;
    } catch (error) {
      console.warn('Failed to cache Mapbox token:', error);
    }
  }

  private async fetchTokenFromEdgeFunction(): Promise<string | null> {
    try {
      console.log('🗺️ Fetching Mapbox token from edge function...');
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      if (error) {
        console.error('Edge function error:', error);
        // Check if it's a token configuration issue
        if (error.message?.includes('token not configured')) {
          console.warn('🚨 Mapbox token not configured in environment variables');
          return 'MISSING_TOKEN_ERROR';
        }
        throw new Error(`Token fetch failed: ${error.message}`);
      }
      
      if (data?.token) {
        // Validate token format (basic check)
        if (typeof data.token === 'string' && data.token.startsWith('pk.')) {
          this.saveCachedToken(data.token);
          console.log('🗺️ Valid Mapbox token received and cached');
          return data.token;
        } else {
          throw new Error('Invalid token format received from edge function');
        }
      }
      
      if (data?.error) {
        console.warn('🚨 Mapbox token configuration error:', data.error);
        return 'MISSING_TOKEN_ERROR';
      }
      
      throw new Error('No token returned from edge function');
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      // Return special error code for missing token
      if (error.message?.includes('token not configured')) {
        return 'MISSING_TOKEN_ERROR';
      }
      return null;
    }
  }

  async getToken(): Promise<string | null> {
    // Return cached token if available
    if (this.tokenCache) {
      return this.tokenCache.token;
    }

    // If already fetching, return the existing promise
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Fetch new token
    this.tokenPromise = this.fetchTokenFromEdgeFunction();
    const token = await this.tokenPromise;
    this.tokenPromise = null;

    return token;
  }

  // Preload token for better performance
  async preloadToken(): Promise<void> {
    if (!this.tokenCache) {
      await this.getToken();
    }
  }

  // Invalidate cache (useful for testing or token refresh)
  invalidateCache(): void {
    this.tokenCache = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if token is available immediately
  hasToken(): boolean {
    return this.tokenCache !== null;
  }

  // Check if there's a token configuration error
  isTokenMissing(token: string | null): boolean {
    return token === 'MISSING_TOKEN_ERROR';
  }
}

export const mapboxService = MapboxService.getInstance();