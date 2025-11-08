import { useState, useEffect, useCallback } from 'react';
import { useOffline } from '@/hooks/useOffline';
import { log } from '@/utils/logger';

interface CachedTile {
  key: string;
  url: string;
  blob: Blob;
  timestamp: number;
}

interface OfflineMapState {
  isOfflineMode: boolean;
  cachedTilesCount: number;
  totalCacheSize: number;
  lastSync: Date | null;
}

export const useOfflineMap = () => {
  const { isOnline } = useOffline();
  const isOffline = !isOnline;
  const [offlineState, setOfflineState] = useState<OfflineMapState>({
    isOfflineMode: false,
    cachedTilesCount: 0,
    totalCacheSize: 0,
    lastSync: null
  });

  // Service Worker registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          log.info('Service worker registered', { component: 'useOfflineMap' });
        })
        .catch(error => {
          log.error('SW registration failed', error, { component: 'useOfflineMap' });
        });
    }
  }, []);

  // Cache management using IndexedDB
  const openCacheDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MapTileCache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('tiles')) {
          const store = db.createObjectStore('tiles', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }, []);

  // Cache tile
  const cacheTile = useCallback(async (url: string, tileKey: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) return false;

      const blob = await response.blob();
      const db = await openCacheDB();
      
      const transaction = db.transaction(['tiles'], 'readwrite');
      const store = transaction.objectStore('tiles');
      
      const cachedTile: CachedTile = {
        key: tileKey,
        url,
        blob,
        timestamp: Date.now()
      };
      
      await store.put(cachedTile);
      
      // Update state
      updateCacheStats();
      
      return true;
    } catch (error) {
      log.error('Failed to cache tile', error, { component: 'useOfflineMap', tileKey });
      return false;
    }
  }, [openCacheDB]);

  // Get cached tile
  const getCachedTile = useCallback(async (tileKey: string): Promise<string | null> => {
    try {
      const db = await openCacheDB();
      const transaction = db.transaction(['tiles'], 'readonly');
      const store = transaction.objectStore('tiles');
      
      const request = store.get(tileKey);
      const result = await new Promise<CachedTile>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result && result.blob) {
        return URL.createObjectURL(result.blob);
      }
      
      return null;
    } catch (error) {
      log.error('Failed to get cached tile', error, { component: 'useOfflineMap', tileKey });
      return null;
    }
  }, [openCacheDB]);

  // Update cache statistics
  const updateCacheStats = useCallback(async () => {
    try {
      const db = await openCacheDB();
      const transaction = db.transaction(['tiles'], 'readonly');
      const store = transaction.objectStore('tiles');
      
      const countRequest = store.count();
      const count = await new Promise<number>((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      });
      
      setOfflineState(prev => ({
        ...prev,
        cachedTilesCount: count,
        totalCacheSize: 0, // Simplified for now
        lastSync: new Date()
      }));
      
    } catch (error) {
      log.error('Failed to update cache stats', error, { component: 'useOfflineMap' });
    }
  }, [openCacheDB]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      const db = await openCacheDB();
      const transaction = db.transaction(['tiles'], 'readwrite');
      const store = transaction.objectStore('tiles');
      
      await store.clear();
      
      setOfflineState(prev => ({
        ...prev,
        cachedTilesCount: 0,
        totalCacheSize: 0,
        lastSync: new Date()
      }));
      
      return true;
    } catch (error) {
      log.error('Failed to clear cache', error, { component: 'useOfflineMap' });
      return false;
    }
  }, [openCacheDB]);

  // Clean old cache entries
  const cleanOldCache = useCallback(async (maxAgeMs: number = 7 * 24 * 60 * 60 * 1000) => {
    try {
      const db = await openCacheDB();
      const transaction = db.transaction(['tiles'], 'readwrite');
      const store = transaction.objectStore('tiles');
      const index = store.index('timestamp');
      
      const cutoffTime = Date.now() - maxAgeMs;
      const range = IDBKeyRange.upperBound(cutoffTime);
      
      // Simplified cleanup for now
      const deleted = 0;
      await updateCacheStats();
      
      return deleted;
    } catch (error) {
      log.error('Failed to clean old cache', error, { component: 'useOfflineMap' });
      return 0;
    }
  }, [openCacheDB, updateCacheStats]);

  // Enable offline mode
  const enableOfflineMode = useCallback(async () => {
    setOfflineState(prev => ({ ...prev, isOfflineMode: true }));
    await updateCacheStats();
  }, [updateCacheStats]);

  // Disable offline mode
  const disableOfflineMode = useCallback(() => {
    setOfflineState(prev => ({ ...prev, isOfflineMode: false }));
  }, []);

  // Initialize cache stats on mount
  useEffect(() => {
    updateCacheStats();
  }, [updateCacheStats]);

  // Auto-enable offline mode when offline
  useEffect(() => {
    if (isOffline && !offlineState.isOfflineMode) {
      enableOfflineMode();
    }
  }, [isOffline, offlineState.isOfflineMode, enableOfflineMode]);

  return {
    ...offlineState,
    isOffline,
    cacheTile,
    getCachedTile,
    clearCache,
    cleanOldCache,
    enableOfflineMode,
    disableOfflineMode,
    updateCacheStats
  };
};