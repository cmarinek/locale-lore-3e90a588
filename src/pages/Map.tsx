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
import { MapPin, Crosshair, Route } from 'lucide-react';
import { Place } from '@/types/location';
import { geocodingService } from '@/services/geocodingService';
import { getRadiusForZoom } from '@/types/location';
import { filterByRadius, sortByDistance, addDistanceToItems } from '@/utils/distanceUtils';
import { MapFilters, DistanceFilter, SortOption } from '@/components/map/MapFilters';
import { MapSidePanel } from '@/components/map/MapSidePanel';
import { TourBuilder } from '@/components/map/TourBuilder';
import { TourDetailsPanel } from '@/components/map/TourDetailsPanel';
import { TourWaypoint, TravelMode, FactTour } from '@/types/tour';
import { directionsService } from '@/services/directionsService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const Map: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { facts, selectedFact, setSelectedFact, fetchFactById, initializeData, categories } = useDiscoveryStore();
  const { center, zoom, setCenter, setZoom, selectedMarkerId, setSelectedMarkerId } = useMapStore();
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'hybrid'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [factsInView, setFactsInView] = useState<number>(0);

  // Filter state
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(999999); // Anywhere
  const [sortBy, setSortBy] = useState<SortOption>('distance');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Side panel state
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  // Tour mode state
  const [isTourMode, setIsTourMode] = useState(false);
  const [tourWaypoints, setTourWaypoints] = useState<TourWaypoint[]>([]);
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [activeTour, setActiveTour] = useState<FactTour | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

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

    // If in tour mode, add to waypoints instead of opening modal
    if (isTourMode) {
      handleAddToTour(enhancedFact);
    } else {
      setSelectedFact(enhancedFact);
      setSelectedMarkerId(fact.id);
    }
  };

  const handleCloseModal = () => {
    setSelectedFact(null);
    setSelectedMarkerId(null);
  };

  const handleCardClick = (fact: any) => {
    setSelectedFact(fact);
    setSelectedMarkerId(fact.id);
  };

  const handleNavigateToFact = (fact: any) => {
    setCenter([fact.longitude, fact.latitude]);
    setZoom(16);
    setSelectedMarkerId(fact.id);
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
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location: [number, number] = [longitude, latitude];
          setUserLocation(location);
          setCenter(location);
          setZoom(14);

          // Auto-load nearby facts
          const radius = distanceFilter === 999999 ? 5 : distanceFilter; // Default 5 miles
          const nearbyFacts = filterByRadius(facts, latitude, longitude, radius);

          // Reverse geocode to get place name
          try {
            const place = await geocodingService.reverseGeocode(longitude, latitude);
            if (place) {
              setCurrentLocation(place.full_name);
            } else {
              setCurrentLocation('Your location');
            }
          } catch (error) {
            console.error('❌ [Map] Reverse geocode error:', error);
            setCurrentLocation('Your location');
          }

          setFactsInView(nearbyFacts.length);
          console.log(`📍 [Map] Centered on user location: ${latitude}, ${longitude}`);
          console.log(`📊 [Map] Found ${nearbyFacts.length} facts within ${radius} miles`);
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

  // Tour handlers
  const handleToggleTourMode = () => {
    if (isTourMode) {
      // Exit tour mode - reset everything
      setIsTourMode(false);
      setTourWaypoints([]);
      setActiveTour(null);
      toast.info('Tour mode cancelled');
    } else {
      // Enter tour mode
      setIsTourMode(true);
      setActiveTour(null);
      toast.success('Tour mode activated. Click on facts to add them to your tour!');
    }
  };

  const handleAddToTour = (fact: any) => {
    // Check if already in tour
    if (tourWaypoints.some((wp) => wp.fact.id === fact.id)) {
      toast.info(`${fact.title} is already in your tour`);
      return;
    }

    const waypoint: TourWaypoint = {
      fact,
      order: tourWaypoints.length,
      coordinates: [fact.longitude, fact.latitude],
    };

    setTourWaypoints([...tourWaypoints, waypoint]);
    toast.success(`Added ${fact.title} to tour (${tourWaypoints.length + 1} stops)`);
  };

  const handleRemoveWaypoint = (factId: string) => {
    const updated = tourWaypoints
      .filter((wp) => wp.fact.id !== factId)
      .map((wp, index) => ({ ...wp, order: index }));
    setTourWaypoints(updated);
  };

  const handleReorderWaypoint = (fromIndex: number, toIndex: number) => {
    const updated = [...tourWaypoints];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    // Update order numbers
    const reordered = updated.map((wp, index) => ({ ...wp, order: index }));
    setTourWaypoints(reordered);
  };

  const handleOptimizeRoute = () => {
    if (tourWaypoints.length <= 2) {
      toast.info('Add at least 3 stops to optimize the route');
      return;
    }

    setIsOptimizing(true);
    try {
      const optimized = directionsService.optimizeWaypointOrder(tourWaypoints);
      setTourWaypoints(optimized);
      toast.success('Route optimized for shortest distance!');
    } catch (error) {
      console.error('❌ [Map] Route optimization error:', error);
      toast.error('Failed to optimize route');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleBuildTour = async () => {
    if (tourWaypoints.length < 2) {
      toast.error('Add at least 2 stops to build a tour');
      return;
    }

    setIsBuilding(true);
    try {
      // Get route from Mapbox Directions API
      const response = await directionsService.getRoute(tourWaypoints, travelMode, {
        steps: true,
        geometries: 'geojson',
      });

      // Build segments from response
      const segments = directionsService.buildRouteSegments(response, tourWaypoints);

      // Calculate totals
      const { totalDistance, totalDuration } = directionsService.calculateTotals(segments);

      // Create tour object
      const tour: FactTour = {
        id: Date.now().toString(),
        name: `Tour of ${tourWaypoints.length} facts`,
        waypoints: tourWaypoints,
        segments,
        totalDistance,
        totalDuration,
        travelMode,
        createdAt: new Date(),
        optimized: false,
      };

      setActiveTour(tour);
      toast.success('Tour built successfully!');

      console.log('🗺️ [Map] Tour built:', {
        waypoints: tour.waypoints.length,
        distance: tour.totalDistance,
        duration: tour.totalDuration,
      });
    } catch (error) {
      console.error('❌ [Map] Build tour error:', error);
      toast.error('Failed to build tour. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleEditTour = () => {
    setActiveTour(null);
    toast.info('Edit mode activated');
  };

  const handleShareTour = () => {
    if (!activeTour) return;

    // Build shareable URL with tour waypoints
    const factIds = activeTour.waypoints.map((wp) => wp.fact.id).join(',');
    const shareUrl = `${window.location.origin}/map?tour=${factIds}&mode=${travelMode}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        toast.success('Tour link copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy link');
      });
  };

  const handleCloseTour = () => {
    setActiveTour(null);
    setIsTourMode(false);
    setTourWaypoints([]);
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

  // Load tour from URL parameters
  useEffect(() => {
    const tourParam = searchParams.get('tour');
    const modeParam = searchParams.get('mode');

    if (tourParam && facts.length > 0) {
      const factIds = tourParam.split(',');
      const tourFacts = factIds
        .map((id) => facts.find((f) => f.id === id))
        .filter((f): f is typeof f & object => f !== undefined);

      if (tourFacts.length >= 2) {
        console.log('🗺️ [Map] Loading tour from URL:', tourFacts.length, 'facts');

        // Build waypoints
        const waypoints: TourWaypoint[] = tourFacts.map((fact, index) => ({
          fact,
          order: index,
          coordinates: [fact.longitude, fact.latitude],
        }));

        setTourWaypoints(waypoints);
        setTravelMode((modeParam as TravelMode) || 'walking');
        setIsTourMode(true);

        // Auto-build tour
        setTimeout(() => {
          handleBuildTour();
        }, 500);
      }
    }
  }, [searchParams, facts]);

  // Filter and sort facts based on all criteria
  const filteredFacts = React.useMemo(() => {
    let result = [...facts];

    // 1. Apply search query filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (fact) =>
          fact.title.toLowerCase().includes(lowerQuery) ||
          fact.description?.toLowerCase().includes(lowerQuery) ||
          fact.location_name?.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      result = result.filter((fact) => fact.category_id === categoryFilter);
    }

    // 3. Apply distance filter (if user location or current location is set)
    if (distanceFilter !== 999999) {
      const centerPoint = userLocation || (currentLocation && center);
      if (centerPoint) {
        const [lng, lat] = Array.isArray(centerPoint) ? centerPoint : center;
        result = filterByRadius(result, lat, lng, distanceFilter);
      }
    }

    // 4. Apply sorting
    if (sortBy === 'distance' && (userLocation || currentLocation)) {
      const [lng, lat] = userLocation || center;
      result = sortByDistance(result, lat, lng);
    } else if (sortBy === 'recent') {
      result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === 'popular') {
      result.sort(
        (a, b) =>
          (b.vote_count_up || 0) - (b.vote_count_down || 0) -
          ((a.vote_count_up || 0) - (a.vote_count_down || 0))
      );
    } else if (sortBy === 'verified') {
      result.sort((a, b) => {
        if (a.status === 'verified' && b.status !== 'verified') return -1;
        if (a.status !== 'verified' && b.status === 'verified') return 1;
        return 0;
      });
    }

    // 5. Add distance information if location is set
    if (userLocation || currentLocation) {
      const [lng, lat] = userLocation || center;
      result = addDistanceToItems(result, lat, lng);
    }

    return result;
  }, [facts, searchQuery, categoryFilter, distanceFilter, sortBy, userLocation, currentLocation, center]);

  // Calculate stats
  const totalFacts = filteredFacts.length;
  const verifiedFacts = filteredFacts.filter(f => f.status === 'verified').length;

  return (
    <MainLayout
      totalStories={totalFacts}
      verifiedStories={verifiedFacts}
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
          <title>Explore Map - Discover Local Facts & Lore</title>
          <meta name="description" content="Explore local facts, legends, and historical lore on an interactive map. Discover verified historical sites, cultural heritage, and hidden gems in your area." />
          <link rel="canonical" href="/map" />
        </Helmet>

        {/* Side Panel - Desktop only, shown when location is set and results exist */}
        {(userLocation !== null || currentLocation !== null) && filteredFacts.length > 0 && (
          <div className="hidden md:block">
            <MapSidePanel
              facts={filteredFacts}
              selectedFactId={selectedMarkerId}
              isOpen={isSidePanelOpen}
              onToggle={() => setIsSidePanelOpen(!isSidePanelOpen)}
              onFactClick={handleCardClick}
              onNavigateToFact={handleNavigateToFact}
              title={currentLocation || 'Results'}
              subtitle={`${filteredFacts.length} ${filteredFacts.length === 1 ? 'fact' : 'facts'} found`}
            />
          </div>
        )}

        {/* Full-height map container - adjust for header and side panel */}
        <div
          className={cn(
            'fixed top-16 right-0 bottom-0 bg-background overflow-hidden transition-all duration-300',
            isSidePanelOpen && (userLocation !== null || currentLocation !== null) && filteredFacts.length > 0
              ? 'left-96'
              : 'left-0'
          )}
        >

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
                tourRoute={
                  activeTour
                    ? {
                        coordinates: activeTour.segments.flatMap((seg) => seg.geometry),
                        waypoints: activeTour.waypoints.map((wp) => ({
                          id: wp.fact.id,
                          order: wp.order,
                          coordinates: wp.coordinates,
                        })),
                      }
                    : null
                }
              />
            )}

            {/* Top-left: Search Bar and Location Badge */}
            {!isMapLoading && (
              <div className="fixed top-20 left-4 z-20 space-y-3">
                <div className="w-80">
                  <UnifiedSearchBar
                    onSearch={handleSearch}
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Search cities, places, facts..."
                  />
                </div>

                {/* Location Context Badge */}
                {currentLocation && factsInView > 0 && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-2 shadow-lg backdrop-blur-sm bg-background/95"
                  >
                    <MapPin className="h-3 w-3 mr-2 inline" />
                    {factsInView} {factsInView === 1 ? 'fact' : 'facts'} in {currentLocation}
                  </Badge>
                )}
              </div>
            )}

            {/* Top-right: Action Buttons (Grouped) */}
            {!isMapLoading && (
              <div className="fixed top-20 right-4 z-20 flex flex-col gap-2">
                <Button
                  onClick={handleCenterOnLocation}
                  className="shadow-lg"
                  size="icon"
                  title="Center on my location"
                >
                  <Crosshair className="h-5 w-5" />
                </Button>

                <Button
                  onClick={handleToggleTourMode}
                  className="shadow-lg"
                  size="icon"
                  variant={isTourMode ? 'default' : 'outline'}
                  title={isTourMode ? 'Exit tour mode' : 'Plan a tour'}
                >
                  <Route className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Filters - Below action buttons when location is set */}
            {!isMapLoading && (userLocation || currentLocation) && !isTourMode && (
              <div className="fixed top-36 right-4 z-20">
                <MapFilters
                  distanceFilter={distanceFilter}
                  onDistanceChange={setDistanceFilter}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  categoryFilter={categoryFilter}
                  onCategoryChange={setCategoryFilter}
                  categories={categories.map((cat) => ({
                    id: cat.id,
                    name: cat.category_translations?.[0]?.name || cat.slug,
                    icon: cat.icon,
                  }))}
                  compact={true}
                />
              </div>
            )}

            {/* Tour Builder */}
            {isTourMode && !activeTour && (
              <TourBuilder
                waypoints={tourWaypoints}
                travelMode={travelMode}
                onTravelModeChange={setTravelMode}
                onRemoveWaypoint={handleRemoveWaypoint}
                onReorderWaypoint={handleReorderWaypoint}
                onOptimizeRoute={handleOptimizeRoute}
                onBuildTour={handleBuildTour}
                onCancel={handleToggleTourMode}
                onAddFactClick={() => setIsSidePanelOpen(true)}
                isOptimizing={isOptimizing}
                isBuilding={isBuilding}
              />
            )}

            {/* Tour Details Panel */}
            {activeTour && (
              <TourDetailsPanel
                tour={activeTour}
                onClose={handleCloseTour}
                onEdit={handleEditTour}
                onShare={handleShareTour}
                onNavigateToWaypoint={(factId) => {
                  const waypoint = activeTour.waypoints.find((wp) => wp.fact.id === factId);
                  if (waypoint) {
                    handleNavigateToFact(waypoint.fact);
                  }
                }}
              />
            )}
          </div>
        )}

        {/* Hybrid View - Split screen */}
        {viewMode === 'hybrid' && (
          <div className="fixed bottom-0 left-0 right-0 h-1/3 bg-background border-t border-border overflow-y-auto z-10">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Facts in View</h3>
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
                <h1 className="text-3xl font-bold mb-2">All Facts</h1>
                <p className="text-muted-foreground">
                  Showing {totalFacts} facts ({verifiedFacts} verified)
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
