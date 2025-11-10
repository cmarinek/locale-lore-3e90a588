import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { UnifiedMap } from '@/components/map/UnifiedMap';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useMapStore } from '@/stores/mapStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const Map: React.FC = () => {
  const { facts, selectedFact, setSelectedFact, fetchFactById, initializeData } = useDiscoveryStore();
  const { selectedMarkerId, setSelectedMarkerId } = useMapStore();

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
