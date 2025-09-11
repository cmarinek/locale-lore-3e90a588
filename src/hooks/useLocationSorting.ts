import { useState, useCallback } from 'react';
import { locationService, LocationResult } from '@/utils/location';

interface FactWithDistance {
  id: string;
  latitude: number;
  longitude: number;
  distance?: number;
  [key: string]: any;
}

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

export const useLocationSorting = () => {
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);
  const [lastSortedBy, setLastSortedBy] = useState<'distance' | 'default'>('default');

  const getUserLocation = useCallback(async (): Promise<LocationResult | null> => {
    if (userLocation) return userLocation;
    
    setIsLoadingLocation(true);
    try {
      const location = await locationService.getDeviceLocation();
      setUserLocation(location);
      return location;
    } catch (error) {
      console.error('Failed to get user location:', error);
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  }, [userLocation]);

  const sortFactsByDistance = useCallback(async (facts: FactWithDistance[]): Promise<FactWithDistance[]> => {
    const location = await getUserLocation();
    if (!location) {
      // Fallback to alphabetical sorting if location unavailable
      return facts.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    const [userLng, userLat] = location.coordinates;
    
    // Calculate distances and sort
    const factsWithDistance = facts.map(fact => ({
      ...fact,
      distance: calculateDistance(userLat, userLng, fact.latitude, fact.longitude)
    }));

    const sorted = factsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    setLastSortedBy('distance');
    return sorted;
  }, [getUserLocation]);

  const formatDistance = (distance: number | undefined): string => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  return {
    sortFactsByDistance,
    formatDistance,
    isLoadingLocation,
    userLocation,
    lastSortedBy,
    getUserLocation
  };
};