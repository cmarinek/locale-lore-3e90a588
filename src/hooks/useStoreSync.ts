import { useEffect } from 'react';
import { useMapStore } from '@/stores/mapStore';
import { useSearchStore } from '@/stores/searchStore';
import { useUserStore } from '@/stores/userStore';
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
 * Master hook that enables all synchronization
 */
export const useStoreSync = () => {
  useAuthSync();
  useMapSearchSync();
  useLocationSync();
  useFactSync();
};