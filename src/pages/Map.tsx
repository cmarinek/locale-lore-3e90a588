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

export const Map: React.FC = () => {
  const navigate = useNavigate();
  
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

          {/* Mobile-optimized Search Bar - fixed spacing to prevent overlaps */}
          <div className="absolute top-4 left-4 right-16 z-20 max-w-md mx-auto sm:max-w-none sm:left-32 sm:right-56">
            <ModernSearchBar onSearch={handleSearch} placeholder="Search stories on map..." showLocationButton={true} />
          </div>

          {/* View Mode Toggle - positioned to avoid overlaps */}
          <div className="absolute top-4 right-4 z-20">
            <ViewModeToggle variant="glass" />
          </div>

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