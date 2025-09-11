// Context Registry System - v14
// This eliminates TDZ errors by removing React API calls during module initialization

import React from 'react';

// Global registry for contexts
const contextRegistry = new Map<string, React.Context<any>>();

// Safe context creation that only happens after React is loaded
export const createContextSafely = <T>(name: string, defaultValue: T): React.Context<T> => {
  if (!contextRegistry.has(name)) {
    const context = React.createContext<T>(defaultValue);
    contextRegistry.set(name, context);
  }
  return contextRegistry.get(name) as React.Context<T>;
};

// Get context from registry
export const getContext = <T>(name: string): React.Context<T> | null => {
  return contextRegistry.get(name) || null;
};

// Clear registry (for testing)
export const clearContextRegistry = () => {
  contextRegistry.clear();
};