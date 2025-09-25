import { useState, useCallback } from 'react';
import { useDebouncedCallback } from './useEnhancedDebounce';

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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: query,
          format: 'json',
          limit: '10',
          addressdetails: '1',
          extratags: '1',
          namedetails: '1',
          'accept-language': 'en',
          featuretype: 'city',
          // Filter for cities, towns, villages
          'class': 'place',
          'type': 'city,town,village,hamlet'
        }).toString(),
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
      
      // Filter and format results to prioritize actual cities
      const filteredCities = data
        .filter((item: any) => 
          item.address?.city || 
          item.address?.town || 
          item.address?.village ||
          item.type === 'city' ||
          item.type === 'town' ||
          item.type === 'village'
        )
        .map((item: any) => ({
          display_name: item.display_name,
          name: item.address?.city || item.address?.town || item.address?.village || item.name,
          country: item.address?.country || '',
          state: item.address?.state || item.address?.province || '',
          lat: item.lat,
          lon: item.lon,
          place_id: item.place_id
        }))
        .slice(0, 8); // Limit to 8 results for better UX

      setCities(filteredCities);
    } catch (err) {
      console.error('City search error:', err);
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