import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BrowserSafetyWrapper, isNavigatorAvailable } from '@/utils/browser-safety';
import { log } from '@/utils/logger';

export interface OfflineAction {
  id?: string;
  type: 'submit_fact' | 'vote' | 'comment' | 'save_fact';
  data: any;
  timestamp: number;
}

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(() => BrowserSafetyWrapper.isOnline());
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Syncing your changes...');
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You\'re offline. Changes will sync when you reconnect.');
    };

    // Only add event listeners if we have a safe browser environment
    if (typeof window !== 'undefined' && isNavigatorAvailable()) {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const openDB = async (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LocaleLoreDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('pending_actions')) {
          const store = db.createObjectStore('pending_actions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp');
        }
        
        if (!db.objectStoreNames.contains('cached_facts')) {
          const store = db.createObjectStore('cached_facts', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('location', ['latitude', 'longitude']);
        }
      };
    });
  };

  const addPendingAction = async (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const db = await openDB();
    const tx = db.transaction(['pending_actions'], 'readwrite');
    const store = tx.objectStore('pending_actions');
    
    const fullAction: OfflineAction = {
      ...action,
      timestamp: Date.now()
    };
    
    await store.add(fullAction);
    
    setPendingActions(prev => [...prev, fullAction]);
    
    // Safe service worker registration
    if (isNavigatorAvailable() && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await (registration as any).sync.register('background-sync');
        }
      } catch (error) {
        log.warn('Service worker sync registration failed', { component: 'useOffline' });
      }
    }
  };

  const syncPendingActions = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(['pending_actions'], 'readonly');
      const store = tx.objectStore('pending_actions');
      const actions = await new Promise<OfflineAction[]>((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });

      for (const action of actions) {
        try {
          await syncAction(action);
          
          // Remove synced action
          const deleteTx = db.transaction(['pending_actions'], 'readwrite');
          const deleteStore = deleteTx.objectStore('pending_actions');
          await deleteStore.delete(action.id!);
          
          setPendingActions(prev => prev.filter(a => a.id !== action.id));
        } catch (error) {
          log.error('Failed to sync action', error, { component: 'useOffline', actionType: action.type });
        }
      }
    } catch (error) {
      log.error('Failed to sync pending actions', error, { component: 'useOffline' });
    }
  };

  const syncAction = async (action: OfflineAction) => {
    // This would integrate with your actual API calls
    log.debug('Syncing offline action', { component: 'useOffline', actionType: action.type });
    
    // Example implementation - replace with actual API calls
    const { type, data } = action;
    
    switch (type) {
      case 'submit_fact':
        // await supabase.from('facts').insert(data);
        break;
      case 'vote':
        // await supabase.from('votes').upsert(data);
        break;
      case 'comment':
        // await supabase.from('comments').insert(data);
        break;
      case 'save_fact':
        // await supabase.from('saved_facts').insert(data);
        break;
    }
  };

  const cacheFact = async (fact: any) => {
    const db = await openDB();
    const tx = db.transaction(['cached_facts'], 'readwrite');
    const store = tx.objectStore('cached_facts');
    
    await store.put({
      ...fact,
      cached_at: Date.now()
    });
  };

  const getCachedFacts = async (location?: { latitude: number; longitude: number; radius: number }) => {
    const db = await openDB();
    const tx = db.transaction(['cached_facts'], 'readonly');
    const store = tx.objectStore('cached_facts');
    
    if (location) {
      // Simple radius-based filtering - could be improved with proper geo indexing
      const allFacts = await new Promise<any[]>((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });
      
      return allFacts.filter(fact => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          fact.latitude,
          fact.longitude
        );
        return distance <= location.radius;
      });
    }
    
    return new Promise<any[]>((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return {
    isOnline,
    pendingActions,
    addPendingAction,
    syncPendingActions,
    cacheFact,
    getCachedFacts
  };
};