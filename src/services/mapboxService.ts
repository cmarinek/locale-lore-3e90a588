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
        console.error('Failed to fetch Mapbox token:', error);
        return null;
      }

      if (data?.token) {
        return data.token;
      }

      return null;
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      return null;
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