import { supabase } from '@/integrations/supabase/client';

interface GeocodeResult {
  place_name: string;
  center: [number, number];
  geometry: {
    coordinates: [number, number];
  };
  properties: Record<string, any>;
}

interface MapboxResponse {
  features: GeocodeResult[];
}

class MapboxClient {
  private static instance: MapboxClient;

  static getInstance(): MapboxClient {
    if (!MapboxClient.instance) {
      MapboxClient.instance = new MapboxClient();
    }
    return MapboxClient.instance;
  }

  async geocode(query: string): Promise<GeocodeResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-proxy', {
        body: { action: 'geocode', query }
      });

      if (error) {
        console.error('Geocoding error:', error);
        throw new Error('Failed to geocode location');
      }

      return data.features || [];
    } catch (error) {
      console.error('Mapbox geocode error:', error);
      throw error;
    }
  }

  async reverseGeocode(lng: number, lat: number): Promise<GeocodeResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-proxy', {
        body: { action: 'reverse-geocode', lng, lat }
      });

      if (error) {
        console.error('Reverse geocoding error:', error);
        throw new Error('Failed to reverse geocode coordinates');
      }

      return data.features || [];
    } catch (error) {
      console.error('Mapbox reverse geocode error:', error);
      throw error;
    }
  }

  async getDirections(coordinates: string, profile: 'walking' | 'driving' | 'cycling' = 'walking') {
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-proxy', {
        body: { action: 'directions', coordinates, profile }
      });

      if (error) {
        console.error('Directions error:', error);
        throw new Error('Failed to get directions');
      }

      return data;
    } catch (error) {
      console.error('Mapbox directions error:', error);
      throw error;
    }
  }

  async searchPlaces(query: string, proximity?: string): Promise<GeocodeResult[]> {
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-proxy', {
        body: { action: 'places', query, proximity }
      });

      if (error) {
        console.error('Places search error:', error);
        throw new Error('Failed to search places');
      }

      return data.features || [];
    } catch (error) {
      console.error('Mapbox places search error:', error);
      throw error;
    }
  }
}

export const mapboxClient = MapboxClient.getInstance();
export type { GeocodeResult, MapboxResponse };