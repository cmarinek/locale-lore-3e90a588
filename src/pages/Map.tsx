import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { ModernSearchBar } from '@/components/ui/modern-search-bar';
import { useNavigate } from 'react-router-dom';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { ScalableMap } from '@/components/map/ScalableMap';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { FactMarker } from '@/types/map';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useFavoriteCities } from '@/hooks/useFavoriteCities';
import { Button } from '@/components/ui/button';

export const Map: React.FC = () => {
  const navigate = useNavigate();
  const { favoriteCities, loading: citiesLoading } = useFavoriteCities();
  
  const {
    facts,
    selectedFact,
    setSelectedFact,
    filters,
    setFilters,
    searchFacts,
    syncSelectedFact,
    setSyncSelectedFact,
    fetchFactById,
    initializeData
  } = useDiscoveryStore();

  const handleFactClick = (fact: any) => {
    // Convert fact to enhanced format for modal compatibility
    const enhancedFact = {
      id: fact.id,
      title: fact.title,
      description: fact.description || '',
      latitude: fact.latitude,
      longitude: fact.longitude,
      vote_count_up: fact.vote_count_up || 0,
      vote_count_down: fact.vote_count_down || 0,
      author_id: fact.author_id || '',
      category_id: fact.category_id || '',
      status: fact.status || 'pending' as const,
      location_name: fact.location_name || '',
      media_urls: fact.media_urls || [],
      created_at: fact.created_at || new Date().toISOString(),
      updated_at: fact.updated_at || new Date().toISOString(),
      profiles: fact.profiles || {
        id: '',
        username: 'Anonymous',
        avatar_url: null
      },
      categories: fact.categories || {
        slug: fact.category || 'unknown',
        icon: '📍',
        color: '#3B82F6',
        category_translations: [{
          name: fact.category || 'Unknown',
          language_code: 'en'
        }]
      }
    };
    setSelectedFact(enhancedFact);
  };

  const handleSearch = (query: string) => {
    setFilters({ search: query });
    searchFacts(query);
  };

  const handleCityClick = (city: any) => {
    // This would integrate with the map to fly to the city
    console.log('Flying to city:', city);
  };

  const handleCloseModal = () => {
    setSelectedFact(null);
    setSyncSelectedFact(null);
  };

  // Initialize data when component mounts
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Handle syncSelectedFact when component mounts or changes
  useEffect(() => {
    if (syncSelectedFact) {
      const loadFact = async () => {
        const fact = await fetchFactById(syncSelectedFact);
        if (fact) {
          setSelectedFact(fact);
        }
      };
      loadFact();
    }
  }, [syncSelectedFact, setSelectedFact, fetchFactById]);

  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-4xl">🗺️</div>
            <h2 className="text-xl font-semibold">Map Loading Error</h2>
            <p className="text-muted-foreground">There was an issue loading the map. Please refresh to try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Refresh Map
            </button>
          </div>
        </div>
      }
    >
      <MainLayout>
        <Helmet>
          <title>Explore Map - Discover Stories Around You</title>
          <meta name="description" content="Explore local stories and legends on an interactive map. Discover historical sites, folklore, and hidden gems in your area." />
          <link rel="canonical" href="/map" />
        </Helmet>

        <div className="h-screen w-full relative">
          {/* Improved Map with Context - Better error handling and architecture */}
          <ErrorBoundary 
            fallback={
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <div className="text-center space-y-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-muted-foreground">Loading interactive map...</p>
                  <p className="text-sm text-muted-foreground/70">This may take a moment</p>
                </div>
              </div>
            }
          >
            <ScalableMap
              facts={facts.map(fact => ({
                id: fact.id,
                title: fact.title,
                latitude: fact.latitude,
                longitude: fact.longitude,
                category: fact.categories?.slug || 'unknown',
                vote_count_up: fact.vote_count_up || 0,
                properties: fact
              }))}
              onFactClick={handleFactClick}
              center={[0, 20]}
              zoom={2}
              style="light"
            />
          </ErrorBoundary>

          {/* Mobile-optimized Search Bar - better positioning for mobile */}
          <div className="absolute top-3 left-3 right-20 z-20 sm:left-4 sm:right-72 sm:top-4">
            <div className="max-w-md mx-auto sm:mx-0">
              <ModernSearchBar onSearch={handleSearch} placeholder="Search stories..." showLocationButton={true} />
            </div>
          </div>

          {/* View Mode Toggle - mobile-friendly positioning */}
          <div className="absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
            <ViewModeToggle variant="glass" />
          </div>

          {/* Favorite Cities */}
          {!citiesLoading && favoriteCities.length > 0 && (
            <div className="absolute top-20 left-3 z-20 sm:left-4 sm:top-24">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg border shadow-lg p-2">
                <div className="flex flex-col gap-1">
                  {favoriteCities.slice(0, 3).map((city, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCityClick(city)}
                      className="h-6 md:h-8 px-1 md:px-2 justify-start text-xs"
                    >
                      <span className="mr-1 text-xs">{city.emoji}</span>
                      <span className="truncate">{city.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fact Preview Modal */}
          {selectedFact && (
            <FactPreviewModal
              fact={selectedFact}
              open={true}
              onClose={handleCloseModal}
            />
          )}

        </div>
      </MainLayout>
    </ErrorBoundary>
  );
};

export default Map;