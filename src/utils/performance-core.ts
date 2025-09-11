// Performance optimization utilities - single source of truth for performance patterns
import { lazy, ComponentType, LazyExoticComponent } from 'react';

// Bundle splitting helpers
export const ROUTE_CHUNKS = {
  AUTH: () => import('@/pages/AuthMain'),
  EXPLORE: () => import('@/pages/Explore'),
  MAP: () => import('@/pages/Map'),
  PROFILE: () => import('@/pages/Profile'),
  ADMIN: () => import('@/pages/Admin'),
  BILLING: () => import('@/pages/Billing'),
  SOCIAL: () => import('@/pages/Social'),
  STORIES: () => import('@/pages/Stories')
} as const;

// Preload critical routes
export function preloadRoute(routeName: keyof typeof ROUTE_CHUNKS) {
  if (typeof window !== 'undefined') {
    ROUTE_CHUNKS[routeName]().catch(error => {
      console.warn(`Failed to preload route ${routeName}:`, error);
    });
  }
}

// Performance measurement
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();
  
  static start(label: string) {
    this.measurements.set(label, performance.now());
  }
  
  static end(label: string): number {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${label}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.measurements.delete(label);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
}