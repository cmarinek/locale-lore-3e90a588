/**
 * Location and Place Types for Geocoding
 */

export interface Coordinates {
  longitude: number;
  latitude: number;
}

export interface Place {
  id: string;
  name: string;
  full_name: string;
  place_type: PlaceType[];
  coordinates: Coordinates;
  bbox?: [number, number, number, number]; // Bounding box [minLng, minLat, maxLng, maxLat]
  context?: PlaceContext[];
  relevance?: number;
}

export type PlaceType =
  | 'country'
  | 'region'
  | 'postcode'
  | 'district'
  | 'place'
  | 'locality'
  | 'neighborhood'
  | 'address'
  | 'poi';

export interface PlaceContext {
  id: string;
  text: string;
  short_code?: string;
}

export interface GeocodingResult {
  type: 'place';
  place: Place;
}

/**
 * Zoom levels for different place types
 */
export const PLACE_TYPE_ZOOM: Record<PlaceType, number> = {
  country: 5,
  region: 7,
  postcode: 12,
  district: 10,
  place: 11,
  locality: 13,
  neighborhood: 14,
  address: 16,
  poi: 17,
};

/**
 * Radius in miles for different zoom levels
 */
export const ZOOM_RADIUS_MAP: Record<number, number> = {
  5: 100,  // Country level
  6: 75,
  7: 50,   // Region/State level
  8: 35,
  9: 25,
  10: 15,  // District level
  11: 10,  // City level
  12: 7,
  13: 5,   // Locality level
  14: 3,   // Neighborhood level
  15: 1,   // Street level
  16: 0.5,
  17: 0.25, // POI level
};

/**
 * Get appropriate radius for a zoom level
 */
export function getRadiusForZoom(zoom: number): number {
  const roundedZoom = Math.round(zoom);
  return ZOOM_RADIUS_MAP[roundedZoom] || 5;
}
