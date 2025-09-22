// Lazy loading utility for framer-motion to reduce bundle size on critical path
import { lazy } from 'react';

// Lazy load framer-motion components to avoid blocking critical path
export const LazyMotion = lazy(() => 
  import('framer-motion').then(module => ({
    default: module.motion.div
  }))
);

export const LazyAnimatePresence = lazy(() =>
  import('framer-motion').then(module => ({
    default: module.AnimatePresence
  }))
);

// Progressive enhancement helper
export const useProgressiveMotion = () => {
  const supportsMotion = typeof window !== 'undefined' && 
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return {
    supportsMotion,
    MotionDiv: supportsMotion ? LazyMotion : 'div',
    AnimatePresence: supportsMotion ? LazyAnimatePresence : ({ children }: any) => children
  };
};

// Bundle splitting for motion components
export const loadMotionComponents = () => {
  return import('framer-motion');
};

// Performance-conscious animation variants
export const lightAnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const reducedMotionVariants = {
  initial: {},
  animate: {},
  exit: {}
};