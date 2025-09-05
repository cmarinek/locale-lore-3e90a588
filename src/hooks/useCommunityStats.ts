import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CommunityStats {
  storiesShared: number;
  activeContributors: number;
  locationsCovered: number;
  isLoading: boolean;
  error?: string;
}

export const useCommunityStats = (): CommunityStats => {
  const [stats, setStats] = useState<CommunityStats>({
    storiesShared: 0,
    activeContributors: 0,
    locationsCovered: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch stories count
        const { count: storiesCount, error: storiesError } = await supabase
          .from('facts')
          .select('*', { count: 'exact', head: true });

        if (storiesError) throw storiesError;

        // Fetch active contributors count (users who created facts)
        const { count: contributorsCount, error: contributorsError } = await supabase
          .from('facts')
          .select('author_id', { count: 'exact', head: true });

        if (contributorsError) throw contributorsError;

        // Fetch unique locations count
        const { data: locationsData, error: locationsError } = await supabase
          .from('facts')
          .select('location_name')
          .not('location_name', 'is', null);

        if (locationsError) throw locationsError;

        // Count unique locations
        const uniqueLocations = new Set(
          locationsData?.map(item => item.location_name) || []
        ).size;

        // Get unique contributors
        const { data: uniqueContributorsData, error: uniqueContributorsError } = await supabase
          .from('facts')
          .select('author_id')
          .not('author_id', 'is', null);

        if (uniqueContributorsError) throw uniqueContributorsError;

        const uniqueContributors = new Set(
          uniqueContributorsData?.map(item => item.author_id) || []
        ).size;

        setStats({
          storiesShared: storiesCount || 0,
          activeContributors: uniqueContributors,
          locationsCovered: uniqueLocations,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching community stats:', error);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load stats',
        }));
      }
    };

    fetchStats();
  }, []);

  return stats;
};