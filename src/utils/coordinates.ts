// Coordinate utility functions for map operations
// Standardizes coordinate handling throughout the application

export type Coordinate = [number, number]; // [longitude, latitude] - Mapbox standard
export type LatLng = { lat: number; lng: number };
export type BoundingBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/**
 * Validates if coordinates are within valid ranges
 * @param longitude - Longitude value (-180 to 180)
 * @param latitude - Latitude value (-90 to 90)
 * @returns true if valid, false otherwise
 */
export function isValidCoordinate(longitude: number, latitude: number): boolean {
  return (
    !isNaN(longitude) &&
    !isNaN(latitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90 &&
    isFinite(longitude) &&
    isFinite(latitude)
  );
}

/**
 * Sanitizes coordinates by clamping to valid ranges
 * @param longitude - Raw longitude value
 * @param latitude - Raw latitude value
 * @returns Clamped coordinate pair
 */
export function sanitizeCoordinate(longitude: number, latitude: number): Coordinate {
  const lng = isNaN(longitude) ? 0 : Math.max(-180, Math.min(180, longitude));
  const lat = isNaN(latitude) ? 0 : Math.max(-90, Math.min(90, latitude));
  return [lng, lat];
}

/**
 * Converts various coordinate formats to standard [lng, lat] format
 */
export function toStandardCoordinate(input: any): Coordinate | null {
  try {
    // Handle [lng, lat] array
    if (Array.isArray(input) && input.length >= 2) {
      const [lng, lat] = input;
      if (isValidCoordinate(lng, lat)) {
        return [lng, lat];
      }
    }
    
    // Handle {lng, lat} object
    if (input && typeof input === 'object' && 'lng' in input && 'lat' in input) {
      if (isValidCoordinate(input.lng, input.lat)) {
        return [input.lng, input.lat];
      }
    }
    
    // Handle {longitude, latitude} object
    if (input && typeof input === 'object' && 'longitude' in input && 'latitude' in input) {
      if (isValidCoordinate(input.longitude, input.latitude)) {
        return [input.longitude, input.latitude];
      }
    }
    
    // Handle string coordinates "lng,lat"
    if (typeof input === 'string') {
      const parts = input.split(',');
      if (parts.length === 2) {
        const lng = parseFloat(parts[0].trim());
        const lat = parseFloat(parts[1].trim());
        if (isValidCoordinate(lng, lat)) {
          return [lng, lat];
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Converts coordinate to LatLng object
 */
export function toLatLng(coordinate: Coordinate): LatLng {
  return { lng: coordinate[0], lat: coordinate[1] };
}

/**
 * Calculates distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate [lng, lat]
 * @param coord2 - Second coordinate [lng, lat]
 * @returns Distance in kilometers
 */
export function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth's radius in kilometers
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Creates a bounding box around a center point with given radius
 * @param center - Center coordinate [lng, lat]
 * @param radiusKm - Radius in kilometers
 * @returns Bounding box
 */
export function createBoundingBox(center: Coordinate, radiusKm: number): BoundingBox {
  const [lng, lat] = center;
  
  // Approximate conversion (not exact due to Earth's curvature)
  const latDelta = radiusKm / 111; // 1 degree latitude ≈ 111 km
  const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  
  return {
    north: Math.min(90, lat + latDelta),
    south: Math.max(-90, lat - latDelta),
    east: Math.min(180, lng + lngDelta),
    west: Math.max(-180, lng - lngDelta)
  };
}

/**
 * Validates a bounding box
 */
export function isValidBoundingBox(bbox: BoundingBox): boolean {
  return (
    bbox.north > bbox.south &&
    bbox.east > bbox.west &&
    bbox.north <= 90 &&
    bbox.south >= -90 &&
    bbox.east <= 180 &&
    bbox.west >= -180
  );
}

/**
 * Format coordinates for display
 */
export function formatCoordinate(coordinate: Coordinate, precision: number = 4): string {
  const [lng, lat] = coordinate;
  return `${lat.toFixed(precision)}°, ${lng.toFixed(precision)}°`;
}

/**
 * Default coordinate for fallback (New York City)
 */
export const DEFAULT_COORDINATE: Coordinate = [-74.006, 40.7128];

/**
 * World bounds
 */
export const WORLD_BOUNDS: BoundingBox = {
  north: 85,
  south: -85,
  east: 180,
  west: -180
};