/**
 * Tour and Route Types
 * For "Fact Tours" feature - multi-fact route planning
 */

import { EnhancedFact } from './fact';

export type TravelMode = 'walking' | 'driving' | 'cycling';

export interface TourWaypoint {
  fact: EnhancedFact;
  order: number;
  coordinates: [number, number]; // [lng, lat]
}

export interface RouteStep {
  instruction: string;
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: [number, number];
}

export interface RouteSegment {
  from: TourWaypoint;
  to: TourWaypoint;
  steps: RouteStep[];
  distance: number; // in meters
  duration: number; // in seconds
  geometry: [number, number][]; // Line coordinates for map rendering
}

export interface FactTour {
  id: string;
  name: string;
  waypoints: TourWaypoint[];
  segments: RouteSegment[];
  totalDistance: number; // in miles
  totalDuration: number; // in minutes
  travelMode: TravelMode;
  createdAt: Date;
  optimized?: boolean; // Whether route order has been optimized
}

export interface MapboxDirectionsResponse {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    legs: Array<{
      distance: number;
      duration: number;
      steps: Array<{
        distance: number;
        duration: number;
        geometry: {
          coordinates: [number, number][];
          type: string;
        };
        maneuver: {
          instruction: string;
          location: [number, number];
          type: string;
        };
      }>;
    }>;
  }>;
  waypoints: Array<{
    location: [number, number];
    name: string;
  }>;
}

export interface TourSummary {
  factCount: number;
  totalDistance: string; // formatted (e.g., "5.2 mi")
  totalDuration: string; // formatted (e.g., "1h 30m")
  travelMode: TravelMode;
}

export interface TourShareData {
  tourId: string;
  tourName: string;
  factIds: string[];
  travelMode: TravelMode;
  url: string;
  qrCodeUrl?: string;
}
