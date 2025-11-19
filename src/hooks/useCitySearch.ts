import { useState, useCallback } from 'react';
import { useDebouncedCallback } from './useEnhancedDebounce';
import { log } from '@/utils/logger';

export interface CityResult {
  display_name: string;
  name: string;
  country: string;
  state?: string;
  lat: string;
  lon: string;
  place_id: string;
}

export const useCitySearch = () => {
  const [cities, setCities] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setCities([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Using OpenStreetMap Nominatim API for city search
      log.debug('Searching cities', { component: 'useCitySearch', query });
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${ 
        new URLSearchParams({
          q: query,
          format: 'json',
          limit: '15',
          addressdetails: '1',
          'accept-language': 'en',
          // Focus on populated places
          featuretype: 'settlement'
        }).toString()}`,
        {
          headers: {
            'User-Agent': 'LocaleLore-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search cities');
      }

      const data = await response.json();
      log.debug('City search API response', { component: 'useCitySearch', resultsCount: data?.length });
      
      // Better filtering and prioritization for cities
      const filteredCities = data
        .filter((item: any) => {
          // Include places that are cities, towns, villages, or administrative areas with population
          const hasSettlement = item.class === 'place' && 
            ['city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood'].includes(item.type);
          const hasAdminCity = item.address && (
            item.address.city || 
            item.address.town || 
            item.address.village ||
            item.address.municipality
          );
          const isNotCountryOrState = item.type !== 'country' && item.type !== 'state';
          
          return (hasSettlement || hasAdminCity) && isNotCountryOrState;
        })
        // Sort by importance (cities first, then towns, then villages)
        .sort((a: any, b: any) => {
          const getImportance = (item: any) => {
            if (item.type === 'city' || item.address?.city) return 3;
            if (item.type === 'town' || item.address?.town) return 2;
            if (item.type === 'village' || item.address?.village) return 1;
            return 0;
          };
          return getImportance(b) - getImportance(a);
        })
        .map((item: any) => {
          const cityName = item.address?.city || 
                          item.address?.town || 
                          item.address?.village || 
                          item.address?.municipality ||
                          item.name;
          
          return {
            display_name: item.display_name,
            name: cityName,
            country: item.address?.country || '',
            state: item.address?.state || item.address?.province || item.address?.region || '',
            lat: item.lat,
            lon: item.lon,
            place_id: item.place_id
          };
        })
        .slice(0, 8); // Limit to 8 results for better UX

      log.debug('Filtered cities', { component: 'useCitySearch', count: filteredCities.length });
      setCities(filteredCities);
      
      if (filteredCities.length === 0 && data.length > 0) {
        setError('No cities found. Try a different search term.');
      }
    } catch (err) {
      log.error('City search error', err, { component: 'useCitySearch', query });
      setError('Failed to search cities. Please try again.');
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const { callback: debouncedSearch } = useDebouncedCallback(searchCities, 300);

  const clearResults = useCallback(() => {
    setCities([]);
    setError(null);
  }, []);

  return {
    cities,
    loading,
    error,
    searchCities: debouncedSearch,
    clearResults
  };
};