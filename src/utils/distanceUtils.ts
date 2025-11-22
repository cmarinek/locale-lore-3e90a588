/**
 * Distance calculation utilities using Haversine formula
 */

export interface DistanceResult {
  miles: number;
  kilometers: number;
  formatted: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance for display
 * @param miles Distance in miles
 * @returns Formatted string (e.g., "0.3 mi", "1.2 mi", "15 mi")
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return 'nearby';
  } else if (miles < 1) {
    return `${miles.toFixed(1)} mi`;
  } else if (miles < 10) {
    return `${miles.toFixed(1)} mi`;
  } else {
    return `${Math.round(miles)} mi`;
  }
}

/**
 * Get distance with all formats
 */
export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): DistanceResult {
  const miles = calculateDistance(lat1, lon1, lat2, lon2);
  const kilometers = miles * 1.60934;

  return {
    miles,
    kilometers,
    formatted: formatDistance(miles),
  };
}

/**
 * Filter items by distance radius
 */
export function filterByRadius<T extends { latitude: number; longitude: number }>(
  items: T[],
  centerLat: number,
  centerLon: number,
  radiusMiles: number
): T[] {
  return items.filter((item) => {
    const distance = calculateDistance(centerLat, centerLon, item.latitude, item.longitude);
    return distance <= radiusMiles;
  });
}

/**
 * Sort items by distance from center point
 */
export function sortByDistance<T extends { latitude: number; longitude: number }>(
  items: T[],
  centerLat: number,
  centerLon: number
): T[] {
  return [...items].sort((a, b) => {
    const distA = calculateDistance(centerLat, centerLon, a.latitude, a.longitude);
    const distB = calculateDistance(centerLat, centerLon, b.latitude, b.longitude);
    return distA - distB;
  });
}

/**
 * Add distance property to items
 */
export function addDistanceToItems<T extends { latitude: number; longitude: number }>(
  items: T[],
  centerLat: number,
  centerLon: number
): (T & { distance: number; distanceFormatted: string })[] {
  return items.map((item) => {
    const distance = calculateDistance(centerLat, centerLon, item.latitude, item.longitude);
    return {
      ...item,
      distance,
      distanceFormatted: formatDistance(distance),
    };
  });
}
