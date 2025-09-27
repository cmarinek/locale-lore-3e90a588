import React from 'react';
import { useStoreSync } from '@/hooks/useStoreSync';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes store synchronization
 * This ensures all stores are kept in sync across the application
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Initialize store synchronization
  useStoreSync();
  
  return <>{children}</>;
};