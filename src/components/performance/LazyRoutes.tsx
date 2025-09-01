
import { lazy } from 'react';

// Lazy load route components for better performance
export const LazyExplore = lazy(async () => {
  const module = await import('@/pages/Explore');
  return { default: module.default || module };
});

export const LazySearch = lazy(async () => {
  const module = await import('@/pages/Search');
  return { default: module.default || module };
});

export const LazySubmit = lazy(async () => {
  const module = await import('@/pages/Submit');
  return { default: module.default || module };
});

export const LazyProfile = lazy(async () => {
  const module = await import('@/pages/Profile');
  return { default: module.default || module };
});

export const LazyFact = lazy(async () => {
  const module = await import('@/pages/Fact');
  return { default: module.default || module };
});

export const LazyAdmin = lazy(async () => {
  const module = await import('@/pages/Admin');
  return { default: module.default || module };
});

export const LazyGamification = lazy(async () => {
  const module = await import('@/pages/Gamification');
  return { default: module.default || module };
});
