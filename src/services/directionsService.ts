/**
 * Mapbox Directions API Service
 * For route planning and turn-by-turn directions
 */

import { mapboxService } from './mapboxService';
import {
  MapboxDirectionsResponse,
  RouteSegment,
  RouteStep,
  TourWaypoint,
  TravelMode,
} from '@/types/tour';

class DirectionsService {
  private baseUrl = 'https://api.mapbox.com/directions/v5/mapbox';

  /**
   * Get route between multiple waypoints
   */
  async getRoute(
    waypoints: TourWaypoint[],
    travelMode: TravelMode = 'walking',
    options: {
      optimize?: boolean; // Optimize waypoint order
      steps?: boolean; // Include turn-by-turn steps
      geometries?: 'geojson' | 'polyline';
    } = {}
  ): Promise<MapboxDirectionsResponse> {
    if (waypoints.length < 2) {
      throw new Error('At least 2 waypoints are required for routing');
    }

    const token = await mapboxService.getToken();
    if (!token) {
      throw new Error('Mapbox token not available');
    }

    // Build coordinates string: "lng,lat;lng,lat;..."
    const coordinates = waypoints
      .map((wp) => `${wp.coordinates[0]},${wp.coordinates[1]}`)
      .join(';');

    // Map our travel mode to Mapbox profile
    const profile = this.getTravelProfile(travelMode);

    // Build query parameters
    const params = new URLSearchParams({
      access_token: token,
      geometries: options.geometries || 'geojson',
      steps: (options.steps !== false).toString(), // Default true
      overview: 'full',
      annotations: 'distance,duration',
    });

    // Add waypoint optimization if requested (reorder waypoints for shortest route)
    if (options.optimize && waypoints.length > 2) {
      // Don't optimize first and last waypoint
      const optimizeIndices = Array.from(
        { length: waypoints.length - 2 },
        (_, i) => i + 1
      ).join(';');
      params.append('waypoints', `0;${optimizeIndices};${waypoints.length - 1}`);
      params.append('waypoint_names', waypoints.map((wp) => wp.fact.title).join(';'));
    }

    const url = `${this.baseUrl}/${profile}/${coordinates}?${params.toString()}`;

    console.log('[DirectionsService] Fetching route:', {
      waypoints: waypoints.length,
      travelMode,
      optimize: options.optimize,
    });

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      console.error('[DirectionsService] API error:', error);
      throw new Error(`Directions API error: ${error.message || response.statusText}`);
    }

    const data: MapboxDirectionsResponse = await response.json();

    console.log('[DirectionsService] Route received:', {
      routes: data.routes.length,
      distance: data.routes[0]?.distance,
      duration: data.routes[0]?.duration,
    });

    return data;
  }

  /**
   * Build route segments from Mapbox response
   */
  buildRouteSegments(
    response: MapboxDirectionsResponse,
    waypoints: TourWaypoint[]
  ): RouteSegment[] {
    const segments: RouteSegment[] = [];
    const route = response.routes[0];

    if (!route || !route.legs) {
      return segments;
    }

    // Each leg represents the route between two consecutive waypoints
    route.legs.forEach((leg, index) => {
      const from = waypoints[index];
      const to = waypoints[index + 1];

      if (!from || !to) return;

      const steps: RouteStep[] = leg.steps.map((step) => ({
        instruction: step.maneuver.instruction,
        distance: step.distance,
        duration: step.duration,
        coordinates: step.maneuver.location,
      }));

      segments.push({
        from,
        to,
        steps,
        distance: leg.distance,
        duration: leg.duration,
        geometry: leg.steps.flatMap((step) => step.geometry.coordinates),
      });
    });

    return segments;
  }

  /**
   * Calculate total distance and duration
   */
  calculateTotals(segments: RouteSegment[]): {
    totalDistance: number; // in miles
    totalDuration: number; // in minutes
  } {
    const totalMeters = segments.reduce((sum, seg) => sum + seg.distance, 0);
    const totalSeconds = segments.reduce((sum, seg) => sum + seg.duration, 0);

    return {
      totalDistance: this.metersToMiles(totalMeters),
      totalDuration: Math.ceil(totalSeconds / 60),
    };
  }

  /**
   * Format distance for display
   */
  formatDistance(meters: number): string {
    const miles = this.metersToMiles(meters);

    if (miles < 0.1) {
      const feet = Math.round(meters * 3.28084);
      return `${feet} ft`;
    }

    return `${miles.toFixed(1)} mi`;
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${minutes}m`;
  }

  /**
   * Convert meters to miles
   */
  private metersToMiles(meters: number): number {
    return meters * 0.000621371;
  }

  /**
   * Map travel mode to Mapbox profile
   */
  private getTravelProfile(mode: TravelMode): string {
    switch (mode) {
      case 'walking':
        return 'walking';
      case 'driving':
        return 'driving';
      case 'cycling':
        return 'cycling';
      default:
        return 'walking';
    }
  }

  /**
   * Optimize waypoint order using nearest neighbor algorithm
   * This is a local optimization before sending to Mapbox
   */
  optimizeWaypointOrder(waypoints: TourWaypoint[]): TourWaypoint[] {
    if (waypoints.length <= 2) return waypoints;

    // Keep first waypoint fixed (starting point)
    const start = waypoints[0];
    const remaining = waypoints.slice(1);
    const optimized: TourWaypoint[] = [start];

    let current = start;

    while (remaining.length > 0) {
      // Find nearest unvisited waypoint
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistance(
        current.coordinates,
        remaining[0].coordinates
      );

      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistance(
          current.coordinates,
          remaining[i].coordinates
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      // Add nearest to optimized list
      const nearest = remaining.splice(nearestIndex, 1)[0];
      optimized.push(nearest);
      current = nearest;
    }

    // Update order numbers
    return optimized.map((wp, index) => ({
      ...wp,
      order: index,
    }));
  }

  /**
   * Simple distance calculation between two coordinates
   */
  private calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
  ): number {
    const [lng1, lat1] = coord1;
    const [lng2, lat2] = coord2;

    const R = 3958.8; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export const directionsService = new DirectionsService();
