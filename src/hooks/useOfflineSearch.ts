import { useState, useEffect } from 'react';
import { useOffline } from './useOffline';
import { FactType } from '@/types';

export const useOfflineSearch = () => {
  const [cachedFacts, setCachedFacts] = useState<FactType[]>([]);
  const [searchResults, setSearchResults] = useState<FactType[]>([]);
  const { isOnline, getCachedFacts } = useOffline();

  useEffect(() => {
    loadCachedFacts();
  }, []);

  const loadCachedFacts = async () => {
    try {
      const facts = await getCachedFacts();
      setCachedFacts(facts);
    } catch (error) {
      console.error('Failed to load cached facts:', error);
    }
  };

  const searchOffline = (query: string, filters: any = {}) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = cachedFacts.filter(fact => {
      // Text search
      const matchesQuery = 
        fact.title?.toLowerCase().includes(query.toLowerCase()) ||
        fact.description?.toLowerCase().includes(query.toLowerCase()) ||
        fact.location_name?.toLowerCase().includes(query.toLowerCase());

      // Category filter
      const matchesCategory = !filters.categories?.length || 
        filters.categories.includes(fact.category_id);

      // Location filter (if available)
      const matchesLocation = !filters.center || !filters.radius ||
        calculateDistance(
          filters.center[1], // lat
          filters.center[0], // lng
          fact.latitude,
          fact.longitude
        ) <= filters.radius;

      return matchesQuery && matchesCategory && matchesLocation;
    });

    // Sort by relevance (simple scoring)
    const scored = filtered.map(fact => ({
      ...fact,
      score: calculateRelevanceScore(fact, query)
    })).sort((a, b) => b.score - a.score);

    setSearchResults(scored);
  };

  const calculateRelevanceScore = (fact: FactType, query: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Title match (highest weight)
    if (fact.title?.toLowerCase().includes(queryLower)) {
      score += 10;
      if (fact.title?.toLowerCase().startsWith(queryLower)) {
        score += 5; // Bonus for prefix match
      }
    }

    // Location name match
    if (fact.location_name?.toLowerCase().includes(queryLower)) {
      score += 8;
    }

    // Description match (lower weight)
    if (fact.description?.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    // Popularity boost
    score += Math.min(fact.vote_count_up || 0, 10) * 0.1;

    return score;
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

  const getFeaturedOfflineFacts = () => {
    return cachedFacts
      .sort((a, b) => (b.vote_count_up || 0) - (a.vote_count_up || 0))
      .slice(0, 10);
  };

  const getRecentOfflineFacts = () => {
    return cachedFacts
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  };

  return {
    isOnline,
    cachedFacts,
    searchResults,
    searchOffline,
    getFeaturedOfflineFacts,
    getRecentOfflineFacts,
    refreshCache: loadCachedFacts
  };
};
