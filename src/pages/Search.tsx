import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/templates/MainLayout';
import { AdvancedSearchBar, SearchResults, TrendingSection } from '@/components/search';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface SearchFilters {
  categories: string[];
  status: string;
  verified: boolean;
  location?: { lat: number; lng: number; radius: number };
  dateRange?: { start: string; end: string };
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  vote_count_up: number;
  vote_count_down: number;
  status: string;
  media_urls?: string[];
  profiles: {
    username: string;
    avatar_url?: string;
  };
  categories: {
    slug: string;
    icon: string;
    color: string;
  };
  recommendation_score?: number;
  recommendation_reason?: string;
  trending_score?: number;
}

export const Search: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('lore');
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    status: '',
    verified: false
  });

  // Initialize search from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      performSearch(urlQuery, filters, 1, 'relevance');
    }
  }, [searchParams]);

  const performSearch = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    searchPage: number = 1,
    sort: string = sortBy
  ) => {
    if (!searchQuery.trim() && searchFilters.categories.length === 0) {
      setResults([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('intelligent-search', {
        body: {
          query: searchQuery,
          filters: searchFilters,
          page: searchPage,
          limit: 20,
          sortBy: sort,
          userId: user?.id
        }
      });

      if (error) throw error;

      if (searchPage === 1) {
        setResults(data.results || []);
      } else {
        setResults(prev => [...prev, ...(data.results || [])]);
      }

      setTotal(data.total || 0);
      setHasMore(data.hasMore || false);
      setPage(searchPage);

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again or refine your search terms",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, sortBy, toast]);

  const handleSearch = (searchQuery: string, searchFilters: SearchFilters) => {
    setQuery(searchQuery);
    setFilters(searchFilters);
    setPage(1);

    // Update URL
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params);

    performSearch(searchQuery, searchFilters, 1, sortBy);
  };

  const handleVoiceSearch = (transcript: string) => {
    handleSearch(transcript, filters);
  };

  const handleLoadMore = () => {
    performSearch(query, filters, page + 1, sortBy);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    performSearch(query, filters, 1, newSort);
  };

  const handleTrendingLocationClick = (location: { name: string; lat: number; lng: number }) => {
    const newFilters = {
      ...filters,
      location: { lat: location.lat, lng: location.lng, radius: 5000 }
    };
    handleSearch(location.name, newFilters);
  };

  const handleTrendingFactClick = (factId: string) => {
    navigate(`/fact/${factId}`);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              {t('search.title', 'Discover Local Lore')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('search.description', 'Search through thousands of local stories, legends, and historical facts. Use voice search, apply filters, and discover trending content in your area.')}
            </p>

            {/* Advanced Search Bar */}
            <AdvancedSearchBar
              onSearch={handleSearch}
              onVoiceSearch={handleVoiceSearch}
              initialQuery={query}
              loading={loading}
            />
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Search Results */}
            <div className="lg:col-span-3">
              <SearchResults
                results={results}
                loading={loading}
                query={query}
                total={total}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Trending Section */}
              <TrendingSection
                onLocationClick={handleTrendingLocationClick}
                onFactClick={handleTrendingFactClick}
              />

              {/* Quick Filters */}
              <Card className="p-6 bg-card/50 backdrop-blur">
                <h3 className="font-semibold mb-4">{t('search.quickFilters', 'Quick Filters')}</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleSearch('', { ...filters, verified: true })}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="font-medium">{t('search.filters.verifiedOnly', 'Verified Only')}</div>
                    <div className="text-sm text-muted-foreground">{t('search.filters.verifiedDesc', 'Official and verified content')}</div>
                  </button>
                  
                  <button
                    onClick={() => handleSearch('', { ...filters, status: 'pending' })}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="font-medium">{t('search.filters.recentSubmissions', 'Recent Submissions')}</div>
                    <div className="text-sm text-muted-foreground">{t('search.filters.recentDesc', 'Latest user contributions')}</div>
                  </button>
                  
                  <button
                    onClick={async () => {
                      try {
                        const { locationService } = await import('@/utils/location');
                        const location = await locationService.getDeviceLocation();
                        const [lng, lat] = location.coordinates;
                        const newFilters = {
                          ...filters,
                          location: {
                            lat,
                            lng,
                            radius: 10000
                          }
                        };
                        handleSearch('', newFilters);
                      } catch (error) {
                        console.error('Could not get location:', error);
                      }
                    }}
                    className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="font-medium">{t('search.filters.nearMe', 'Near Me')}</div>
                    <div className="text-sm text-muted-foreground">{t('search.filters.nearMeDesc', 'Content within 10km')}</div>
                  </button>
                </div>
              </Card>

              {/* Search Tips */}
              <Card className="p-6 bg-card/50 backdrop-blur">
                <h3 className="font-semibold mb-4">{t('search.tips.title', 'Search Tips')}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{t('search.tips.exactPhrases', '• Use quotes for exact phrases: "ghost story"')}</p>
                  <p>{t('search.tips.locationNames', '• Try location names: "downtown", "old bridge"')}</p>
                  <p>{t('search.tips.voiceSearch', '• Use voice search for hands-free searching')}</p>
                  <p>{t('search.tips.saveSearches', '• Save frequent searches for quick access')}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};