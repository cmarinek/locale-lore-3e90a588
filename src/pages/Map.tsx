import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { UnifiedMap } from '@/components/map/UnifiedMap';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useMapStore } from '@/stores/mapStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { MapViewSwitcher, MapViewMode } from '@/components/map/MapViewSwitcher';
import { MapStatsOverlay } from '@/components/map/MapStatsOverlay';
import { MapSearchBar } from '@/components/map/MapSearchBar';
import { FactCard } from '@/components/discovery/FactCard';

export const Map: React.FC = () => {
  const { facts, selectedFact, setSelectedFact, fetchFactById, initializeData } = useDiscoveryStore();
  const { selectedMarkerId, setSelectedMarkerId } = useMapStore();
  const [viewMode, setViewMode] = useState<MapViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFactClick = (fact: any) => {
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
    setSelectedMarkerId(fact.id);
  };

  const handleCloseModal = () => {
    setSelectedFact(null);
    setSelectedMarkerId(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement actual search filtering
    console.log('Searching for:', query);
  };

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (selectedMarkerId) {
      const loadFact = async () => {
        const fact = await fetchFactById(selectedMarkerId);
        if (fact) {
          setSelectedFact(fact);
        }
      };
      loadFact();
    }
  }, [selectedMarkerId, setSelectedFact, fetchFactById]);

  // Calculate stats
  const totalStories = facts.length;
  const verifiedStories = facts.filter(f => f.status === 'verified').length;

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

        <div className="fixed inset-0 top-16 z-0">
          {/* View Mode Switcher */}
          <MapViewSwitcher currentView={viewMode} onViewChange={setViewMode} />

          {/* Map View */}
          {(viewMode === 'map' || viewMode === 'hybrid') && (
            <>
              <UnifiedMap
                facts={facts}
                useScalableLoading={false}
                enableClustering={true}
                center={[0, 20]}
                zoom={2}
                style="light"
                onFactClick={handleFactClick}
                className="w-full h-full"
              />

              {/* Stats Overlay */}
              <MapStatsOverlay
                totalStories={totalStories}
                verifiedStories={verifiedStories}
              />

              {/* Search Bar */}
              <MapSearchBar onSearch={handleSearch} />
            </>
          )}

          {/* Hybrid View - Split screen */}
          {viewMode === 'hybrid' && (
            <div className="fixed bottom-0 left-0 right-0 h-1/3 bg-background border-t border-border overflow-y-auto z-10">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Stories in View</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facts.slice(0, 6).map(fact => (
                    <FactCard key={fact.id} fact={fact} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="w-full h-full overflow-y-auto bg-background">
              <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">All Stories</h1>
                  <p className="text-muted-foreground">
                    Showing {totalStories} stories ({verifiedStories} verified)
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {facts.map(fact => (
                    <FactCard key={fact.id} fact={fact} />
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
