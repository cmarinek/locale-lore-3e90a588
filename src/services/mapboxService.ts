import { supabase } from '@/integrations/supabase/client';

class MapboxService {
  private token: string | null = null;
  private tokenPromise: Promise<string | null> | null = null;

  async getToken(): Promise<string | null> {
    console.log('🔑 MapboxService: getToken called', {
      hasCachedToken: !!this.token,
      isCurrentlyFetching: !!this.tokenPromise
    });

    // Return cached token if available
    if (this.token) {
      console.log('✅ Returning cached token');
      return this.token;
    }

    // Return existing promise if already fetching
    if (this.tokenPromise) {
      console.log('⏳ Token fetch in progress, waiting...');
      return this.tokenPromise;
    }

    // Fetch token from Supabase Edge Function
    console.log('🌐 Fetching token from Supabase...');
    this.tokenPromise = this.fetchTokenFromSupabase();
    this.token = await this.tokenPromise;
    this.tokenPromise = null;

    console.log('🔑 Token fetch complete:', this.token ? `${this.token.substring(0, 15)}...` : 'null');
    return this.token;
  }

  private async fetchTokenFromSupabase(): Promise<string | null> {
    try {
      console.log('📡 Calling get-mapbox-token edge function...');
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      
      console.log('📡 Edge function response:', { 
        hasData: !!data, 
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        error: error 
      });

      if (error) {
        console.error('❌ Failed to fetch Mapbox token:', error);
        return null;
      }

      if (data?.token) {
        const cleanToken = data.token.replace(/[\r\n\s]/g, '').trim();
        console.log('✅ Token received and cleaned:', cleanToken ? `${cleanToken.substring(0, 15)}...` : 'empty');
        return cleanToken || null;
      }

      console.warn('⚠️ No token in response data');
      return null;
    } catch (error) {
      console.error('❌ Exception fetching Mapbox token:', error);
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