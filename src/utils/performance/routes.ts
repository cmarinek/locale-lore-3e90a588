// Route preloading and code splitting - SSOT for route-based performance optimization

// Bundle splitting helpers for routes
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
export function preloadRoute(routeName: keyof typeof ROUTE_CHUNKS | (() => Promise<any>)) {
  if (typeof window === 'undefined') return;
  
  const routeImport = typeof routeName === 'function' 
    ? routeName 
    : ROUTE_CHUNKS[routeName];
  
  // Preload route component in idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routeImport().catch(error => {
        console.warn(`Failed to preload route:`, error);
      });
    });
  } else {
    setTimeout(() => {
      routeImport().catch(error => {
        console.warn(`Failed to preload route:`, error);
      });
    }, 100);
  }
}
