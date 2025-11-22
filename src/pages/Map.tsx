import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UnifiedMap } from '@/components/map/UnifiedMap';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useMapStore } from '@/stores/mapStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { UnifiedSearchBar } from '@/components/ui/UnifiedSearchBar';
import { FactCard } from '@/components/discovery/FactCard';
import { MapSkeleton } from '@/components/ui/skeleton-loader';
import { MainLayout } from '@/components/templates/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Crosshair } from 'lucide-react';
import { Place } from '@/types/location';
import { geocodingService } from '@/services/geocodingService';
import { getRadiusForZoom } from '@/types/location';
import { filterByRadius } from '@/utils/distanceUtils';

export const Map: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { facts, selectedFact, setSelectedFact, fetchFactById, initializeData } = useDiscoveryStore();
  const { center, zoom, setCenter, setZoom, selectedMarkerId, setSelectedMarkerId } = useMapStore();
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'hybrid'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [factsInView, setFactsInView] = useState<number>(0);

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
        color: 'hsl(var(--primary))',
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
  };

  const handlePlaceSelect = (place: Place) => {
    console.log(`🌍 [Map] Place selected:`, place.full_name);

    // Get appropriate zoom level for this place type
    const placeZoom = geocodingService.getZoomForPlace(place);

    // Center map on place
    setCenter([place.coordinates.longitude, place.coordinates.latitude]);
    setZoom(placeZoom);

    // Update location context
    setCurrentLocation(place.full_name);

    // Calculate radius for this zoom level
    const radius = getRadiusForZoom(placeZoom);

    // Filter facts within radius
    const factsInRadius = filterByRadius(
      facts,
      place.coordinates.latitude,
      place.coordinates.longitude,
      radius
    );

    setFactsInView(factsInRadius.length);
    console.log(`📊 [Map] Found ${factsInRadius.length} facts within ${radius} miles of ${place.name}`);
  };

  const handleCenterOnLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [longitude, latitude];
          setUserLocation(location);
          setCenter(location);
          setZoom(14);
          console.log(`📍 [Map] Centered on user location: ${latitude}, ${longitude}`);
        },
        (error) => {
          console.error('❌ [Map] Geolocation error:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Load data on mount with detailed logging
  useEffect(() => {
    const loadData = async () => {
      console.log('📊 [Map] Starting data initialization...');
      setIsMapLoading(true);
      try {
        await initializeData();
        console.log('📊 [Map] Data initialization complete');
      } catch (error) {
        console.error('❌ [Map] Data initialization failed:', error);
      } finally {
        // Simulate minimum loading time for smooth UX
        setTimeout(() => {
          setIsMapLoading(false);
          console.log('📊 [Map] Loading state cleared');
        }, 800);
      }
    };
    loadData();
  }, [initializeData]);

  // Log facts when they change
  useEffect(() => {
    console.log(`📊 [Map] Facts updated: ${facts.length} facts available`);
  }, [facts]);

  // Handle URL parameters for centering on specific fact
  useEffect(() => {
    const factId = searchParams.get('factId');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const urlZoom = searchParams.get('zoom');

    if (factId) {
      console.log(`🎯 [Map] Opening fact from URL: ${factId}`);
      setSelectedMarkerId(factId);
      fetchFactById(factId).then(fact => {
        if (fact) {
          setSelectedFact(fact);
          setCenter([fact.longitude, fact.latitude]);
          setZoom(15);
        }
      });
    } else if (lat && lng) {
      console.log(`🎯 [Map] Centering on coordinates from URL: ${lat}, ${lng}`);
      setCenter([parseFloat(lng), parseFloat(lat)]);
      if (urlZoom) {
        setZoom(parseFloat(urlZoom));
      }
    }
  }, [searchParams, fetchFactById, setSelectedFact, setCenter, setZoom, setSelectedMarkerId]);

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

  // Filter facts based on search query
  const filteredFacts = React.useMemo(() => {
    if (!searchQuery.trim()) return facts;
    
    const lowerQuery = searchQuery.toLowerCase();
    return facts.filter(fact => 
      fact.title.toLowerCase().includes(lowerQuery) ||
      fact.description?.toLowerCase().includes(lowerQuery) ||
      fact.location_name?.toLowerCase().includes(lowerQuery)
    );
  }, [facts, searchQuery]);

  // Calculate stats
  const totalStories = filteredFacts.length;
  const verifiedStories = filteredFacts.filter(f => f.status === 'verified').length;

  return (
    <MainLayout
      totalStories={totalStories}
      verifiedStories={verifiedStories}
      mapViewMode={viewMode}
      onMapViewChange={(mode) => setViewMode(mode as 'map' | 'list' | 'hybrid')}
    >
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
        <Helmet>
          <title>Explore Map - Discover Stories Around You</title>
          <meta name="description" content="Explore local stories and legends on an interactive map. Discover historical sites, folklore, and hidden gems in your area." />
          <link rel="canonical" href="/map" />
        </Helmet>

        {/* Full-height map container - adjust for header */}
        <div className="fixed top-16 left-0 right-0 bottom-0 bg-background overflow-hidden">

        {/* Map View */}
        {(viewMode === 'map' || viewMode === 'hybrid') && (
          <div className="relative w-full h-full flex flex-col">
            {isMapLoading ? (
              <MapSkeleton className="w-full h-full" />
            ) : (
              <UnifiedMap
                facts={filteredFacts}
                useScalableLoading={false}
                enableClustering={true}
                center={center}
                zoom={zoom}
                onFactClick={handleFactClick}
                isVisible={true}
                className="w-full flex-1"
              />
            )}

            {/* Search Bar - Overlays map */}
            {!isMapLoading && (
              <div className="fixed top-20 left-4 z-20 w-80">
                <UnifiedSearchBar
                  onSearch={handleSearch}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Search cities, places, stories..."
                />
              </div>
            )}

            {/* Location Context Badge */}
            {!isMapLoading && currentLocation && factsInView > 0 && (
              <div className="fixed top-36 left-4 z-20">
                <Badge
                  variant="secondary"
                  className="px-3 py-2 shadow-lg backdrop-blur-sm bg-background/95"
                >
                  <MapPin className="h-3 w-3 mr-2 inline" />
                  {factsInView} {factsInView === 1 ? 'story' : 'stories'} in {currentLocation}
                </Badge>
              </div>
            )}

            {/* Center on Location Button - Overlays map */}
            {!isMapLoading && (
              <Button
                onClick={handleCenterOnLocation}
                className="fixed top-32 right-4 z-20 shadow-lg"
                size="icon"
                title="Center on my location"
              >
                <Crosshair className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {/* Hybrid View - Split screen */}
        {viewMode === 'hybrid' && (
          <div className="fixed bottom-0 left-0 right-0 h-1/3 bg-background border-t border-border overflow-y-auto z-10">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Stories in View</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFacts.slice(0, 6).map(fact => (
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
                {filteredFacts.map(fact => (
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
    </ErrorBoundary>
    </MainLayout>
  );
};

export default Map;
