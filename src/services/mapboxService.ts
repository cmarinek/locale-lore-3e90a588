import { supabase } from '@/integrations/supabase/client';

class MapboxService {
  private token: string | null = null;
  private tokenPromise: Promise<string | null> | null = null;

  async getToken(): Promise<string | null> {
    // Return cached token if available
    if (this.token) {
      return this.token;
    }

    // Return existing promise if already fetching
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Fetch token from Supabase Edge Function
    this.tokenPromise = this.fetchTokenFromSupabase();
    this.token = await this.tokenPromise;
    this.tokenPromise = null;

    return this.token;
  }

  private async fetchTokenFromSupabase(): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');

      if (error) {
        console.error('❌ [MapboxService] Failed to fetch Mapbox token:', error);
        console.error('❌ [MapboxService] Error type:', typeof error);
        console.error('❌ [MapboxService] Error message:', error.message || 'No message');
        throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
      }

      if (data?.token) {
        // Additional client-side cleaning just in case
        const cleanToken = data.token
          .replace(/[\r\n\t\f\v\s]/g, '')
          .replace(/[^\x20-\x7E]/g, '')
          .trim();
        
        if (cleanToken.length > 0) {
          return cleanToken;
        } else {
          console.error('❌ [MapboxService] Token is empty after cleaning');
          throw new Error('Token is empty after cleaning whitespace');
        }
      }

      if (data?.error) {
        console.error('❌ [MapboxService] Server returned error:', data.error);
        throw new Error(data.error);
      }

      console.warn('⚠️ [MapboxService] No token in response data');
      throw new Error('No token in response data');
    } catch (error) {
      console.error('❌ [MapboxService] Exception fetching Mapbox token:', error);
      console.error('❌ [MapboxService] Exception type:', typeof error);
      console.error('❌ [MapboxService] Exception details:', error);
      throw error;
    }
  }

  // Clear cached token (useful for testing or token refresh)
  clearToken(): void {
    this.token = null;
    this.tokenPromise = null;
  }

  // Check if token is missing
  isTokenMissing(token?: string | null): boolean {
    // If token parameter is provided, check that token
    if (token !== undefined) {
      return !token;
    }
    // Otherwise check the cached token
    return this.token === null;
  }

  // Preload token for better performance
  async preloadToken(): Promise<void> {
    await this.getToken();
  }
}

export const mapboxService = new MapboxService();