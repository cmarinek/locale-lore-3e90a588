/**
 * Mapbox Geocoding API Service
 * Provides place search and forward geocoding
 */

import { Place, PlaceType, PLACE_TYPE_ZOOM } from '@/types/location';
import { mapboxService } from './mapboxService';

interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    accuracy?: string;
  };
  text: string;
  place_name: string;
  center: [number, number];
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  context?: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
  bbox?: [number, number, number, number];
}

interface MapboxGeocodingResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

class GeocodingService {
  private baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private cache = new Map<string, Place[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Search for places using Mapbox Geocoding API
   * @param query Search query (e.g., "New York", "Paris, France", "Eiffel Tower")
   * @param options Search options
   * @returns Array of places
   */
  async searchPlaces(
    query: string,
    options: {
      types?: PlaceType[];
      limit?: number;
      proximity?: [number, number]; // [longitude, latitude]
      bbox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
      country?: string[]; // ISO 3166-1 alpha-2 country codes
    } = {}
  ): Promise<Place[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // Check cache
    const cacheKey = this.getCacheKey(query, options);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const token = await mapboxService.getToken();
      if (!token) {
        console.error('[Geocoding] No Mapbox token available');
        return [];
      }

      // Build URL parameters
      const params = new URLSearchParams({
        access_token: token,
        limit: (options.limit || 5).toString(),
        autocomplete: 'true',
      });

      if (options.types && options.types.length > 0) {
        params.set('types', options.types.join(','));
      }

      if (options.proximity) {
        params.set('proximity', options.proximity.join(','));
      }

      if (options.bbox) {
        params.set('bbox', options.bbox.join(','));
      }

      if (options.country && options.country.length > 0) {
        params.set('country', options.country.join(','));
      }

      // Encode query
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseUrl}/${encodedQuery}.json?${params.toString()}`;

      console.log('[Geocoding] Searching for:', query);

      const response = await fetch(url);
      if (!response.ok) {
        console.error('[Geocoding] API error:', response.status, response.statusText);
        return [];
      }

      const data: MapboxGeocodingResponse = await response.json();

      // Transform Mapbox features to our Place type
      const places: Place[] = data.features.map((feature) => this.transformFeature(feature));

      // Cache results
      this.cache.set(cacheKey, places);
      setTimeout(() => this.cache.delete(cacheKey), this.cacheTimeout);

      console.log('[Geocoding] Found', places.length, 'places');
      return places;
    } catch (error) {
      console.error('[Geocoding] Search error:', error);
      return [];
    }
  }

  /**
   * Get appropriate zoom level for a place
   */
  getZoomForPlace(place: Place): number {
    // Use the first (most specific) place type
    const placeType = place.place_type[0];
    return PLACE_TYPE_ZOOM[placeType] || 11;
  }

  /**
   * Transform Mapbox feature to our Place type
   */
  private transformFeature(feature: MapboxFeature): Place {
    return {
      id: feature.id,
      name: feature.text,
      full_name: feature.place_name,
      place_type: feature.place_type as PlaceType[],
      coordinates: {
        longitude: feature.center[0],
        latitude: feature.center[1],
      },
      bbox: feature.bbox,
      context: feature.context,
      relevance: feature.relevance,
    };
  }

  /**
   * Generate cache key
   */
  private getCacheKey(
    query: string,
    options: {
      types?: PlaceType[];
      limit?: number;
      proximity?: [number, number];
      bbox?: [number, number, number, number];
      country?: string[];
    }
  ): string {
    return JSON.stringify({ query: query.toLowerCase(), ...options });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Reverse geocode - get place from coordinates
   * @param longitude
   * @param latitude
   * @returns Place information
   */
  async reverseGeocode(longitude: number, latitude: number): Promise<Place | null> {
    try {
      const token = await mapboxService.getToken();
      if (!token) {
        console.error('[Geocoding] No Mapbox token available');
        return null;
      }

      const url = `${this.baseUrl}/${longitude},${latitude}.json?access_token=${token}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error('[Geocoding] Reverse geocode error:', response.status);
        return null;
      }

      const data: MapboxGeocodingResponse = await response.json();

      if (data.features.length > 0) {
        return this.transformFeature(data.features[0]);
      }

      return null;
    } catch (error) {
      console.error('[Geocoding] Reverse geocode error:', error);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();
