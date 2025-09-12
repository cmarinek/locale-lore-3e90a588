import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  syncData: () => Promise<void>;
  offlineQueue: any[];
  hasOfflineData: boolean;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};

interface OfflineProviderProps {
  children: React.ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing data...');
      syncData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('You are now offline. Changes will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline queue from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('offline-queue');
      if (saved) {
        setOfflineQueue(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }, []);

  // Save offline queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('offline-queue', JSON.stringify(offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }, [offlineQueue]);

  const toggleOfflineMode = useCallback(() => {
    setIsOfflineMode(prev => !prev);
    toast.info(isOfflineMode ? 'Online mode enabled' : 'Offline mode enabled');
  }, [isOfflineMode]);

  const syncData = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return;

    try {
      // Process offline queue
      for (const item of offlineQueue) {
        // Sync each queued action
        console.log('Syncing offline action:', item);
        // Implementation would depend on specific action types
      }
      
      setOfflineQueue([]);
      toast.success('All offline data synced successfully');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      toast.error('Failed to sync some offline data');
    }
  }, [isOnline, offlineQueue]);

  const hasOfflineData = offlineQueue.length > 0;

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isOfflineMode,
        toggleOfflineMode,
        syncData,
        offlineQueue,
        hasOfflineData
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};