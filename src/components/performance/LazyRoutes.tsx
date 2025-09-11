
import React, { lazy } from 'react';

// Lazy load only the Map component that's actually used
export const LazyMap = lazy(() => import('@/pages/Map').then(module => ({ 
  default: module.Map 
})));
