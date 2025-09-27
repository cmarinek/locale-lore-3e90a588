import { useEffect } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useSearchStore } from '@/stores/searchStore';
import { useUserStore } from '@/stores/userStore';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useCacheStore } from '@/stores/cacheStore';
import { useAuth } from '@/contexts/AuthProvider';

/**
 * Hook to synchronize auth state with user store
 */
export const useAuthSync = () => {
  const { user, session, loading } = useAuth();
  const { setUser, setSession, setLoading } = useUserStore();

  useEffect(() => {
    setUser(user);
    setSession(session);
    setLoading(loading);
  }, [user, session, loading, setUser, setSession, setLoading]);
};

/**
 * Hook to synchronize map state with search filters
 */
export const useMapSearchSync = () => {
  const mapCenter = useMapStore((state) => state.center);
  const mapBounds = useMapStore((state) => state.bounds);
  const { setFilters } = useSearchStore();

  useEffect(() => {
    if (mapCenter && mapBounds) {
      setFilters({
        center: mapCenter,
        location: {
          lat: mapCenter[1],
          lng: mapCenter[0],
        },
      });
    }
  }, [mapCenter, mapBounds, setFilters]);
};

/**
 * Hook to synchronize user location across stores
 */
export const useLocationSync = () => {
  const userLocation = useUserStore((state) => state.location);
  const setMapCenter = useMapStore((state) => state.setCenter);
  const { setFilters } = useSearchStore();

  useEffect(() => {
    if (userLocation) {
      // Update map center when user location changes
      setMapCenter(userLocation);
      
      // Update search filters with user location
      setFilters({
        location: {
          lat: userLocation[1],
          lng: userLocation[0],
        },
      });
    }
  }, [userLocation, setMapCenter, setFilters]);
};

/**
 * Hook to synchronize selected fact across stores
 */
export const useFactSync = () => {
  const selectedMarkerId = useMapStore((state) => state.selectedMarkerId);
  const addToRecentlyViewed = useUserStore((state) => state.addToRecentlyViewed);

  useEffect(() => {
    if (selectedMarkerId) {
      addToRecentlyViewed(selectedMarkerId);
    }
  }, [selectedMarkerId, addToRecentlyViewed]);
};

/**
 * Hook to synchronize settings across the app
 */
export const useSettingsSync = () => {
  const { theme, language } = useSettingsStore();
  
  useEffect(() => {
    // Apply theme
    const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  useEffect(() => {
    // Apply language direction
    const isRTL = ['ar', 'he', 'fa'].includes(language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);
};

/**
 * Hook to manage cache cleanup
 */
export const useCacheSync = () => {
  const { clearExpired } = useCacheStore();
  
  useEffect(() => {
    // Clear expired cache entries every 5 minutes
    const interval = setInterval(clearExpired, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clearExpired]);
};

/**
 * Master hook that enables all synchronization and initializes the app
 */
export const useStoreSync = () => {
  const { initializeData } = useDiscoveryStore();
  
  useAuthSync();
  useMapSearchSync();
  useLocationSync();
  useFactSync();
  useSettingsSync();
  useCacheSync();
  
  // Initialize app data on first mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);
};