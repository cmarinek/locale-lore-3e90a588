import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MainLayout } from '@/components/templates/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Swipeable } from '@/components/ui/swipeable';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useAppStore } from '@/stores/appStore';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  List, 
  Map as MapIcon, 
  Locate,
  MapPin,
  Search as SearchIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { FilterPanel } from '@/components/discovery/FilterPanel';
import { TrendingSection } from '@/components/search/TrendingSection';
import { SearchBar } from '@/components/discovery/SearchBar';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '@/hooks/useTranslation';

export const Explore: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isListView, setIsListView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { triggerHapticFeedback, handleTouchInteraction } = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation('lore');

  // Discovery integration
  const { 
    facts, 
    loading, 
    error, 
    filters,
    selectedFact,
    modalOpen,
    setModalOpen,
    loadCategories,
    loadSavedFacts,
    searchFacts,
    setFilters
  } = useDiscoveryStore();

  // Initialize discovery data
  useEffect(() => {
    loadCategories();
    loadSavedFacts();
    
    // Load initial facts with current filters
    const searchQuery = filters.search || '';
    searchFacts(searchQuery);
  }, [loadCategories, loadSavedFacts, searchFacts]);

  // Initial setup - get token and location
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Get token from Supabase Edge Function
        const response = await fetch('https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/get-mapbox-token');
        if (response.ok) {
          const data = await response.json();
          setMapboxToken(data.token);
        } else {
          console.error('Failed to get Mapbox token');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
      }
    };

    initializeMap();

    // Get user location with improved detection
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { locationService } = await import('@/utils/location');
      const result = await locationService.getDeviceLocation();
      
      setUserLocation(result.coordinates);
      console.log(`Location found: ${result.source} (${result.accuracy})`);
      
      // Show toast based on accuracy
      if (result.accuracy === 'precise') {
        toast.success('Using your current location');
      } else if (result.accuracy === 'region') {
        toast.info('Using your region location');
      } else {
        toast.info('Using fallback location');
      }
    } catch (error) {
      console.error('Failed to get location:', error);
      setUserLocation([-0.1276, 51.5074]); // London fallback
      toast.error('Could not detect location, using default');
    }
  };

  // Map initialization
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !userLocation) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userLocation,
      zoom: 12,
      pitch: 45,
    });

    // Add controls
    map.current.addControl(new mapboxgl.NavigationControl({
      visualizePitch: true,
    }), 'top-right');

    map.current.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right');

    // Add user location marker
    new mapboxgl.Marker({ color: '#007bff' })
      .setLngLat(userLocation)
      .addTo(map.current);

    // Add sample markers
    const sampleFacts = [
      { id: 1, coords: [userLocation[0] + 0.01, userLocation[1] + 0.01], title: "Historic Landmark" },
      { id: 2, coords: [userLocation[0] - 0.01, userLocation[1] + 0.005], title: "Local Legend" },
      { id: 3, coords: [userLocation[0] + 0.005, userLocation[1] - 0.01], title: "Hidden Story" },
    ];

    sampleFacts.forEach(fact => {
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h3 class="font-semibold">${fact.title}</h3><p class="text-sm">Click to learn more...</p>`);

      new mapboxgl.Marker({ color: '#10b981' })
        .setLngLat(fact.coords as [number, number])
        .setPopup(popup)
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation]);

  const handleRefresh = async () => {
    triggerHapticFeedback('medium');
    handleTouchInteraction('tap');
    
    // Refresh both map and discovery data
    await Promise.all([
      loadSavedFacts(),
      searchFacts(filters.search || '')
    ]);
    toast.success('Content refreshed!');
  };

  const handleSwipeLeft = () => {
    triggerHapticFeedback('light');
    navigate('/search');
  };

  const handleSwipeRight = () => {
    triggerHapticFeedback('light');
    navigate('/profile');
  };

  const handleSearch = async (query: string) => {
    setFilters({ search: query });
    await searchFacts(query);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Swipeable
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      className="min-h-screen"
    >
      <MainLayout>
        <Helmet>
          <title>Explore - Local Stories & Lore</title>
          <meta name="description" content="Discover fascinating stories and local lore on an interactive map or browse through our curated collection." />
        </Helmet>
        
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="min-h-screen">
                {isListView ? (
                  // Discovery List View
                  <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl font-bold">Discover Stories</h1>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <Filter className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsListView(false)}
                        >
                          <MapIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                      <SearchBar onQueryChange={handleSearch} />
                    </div>

                    {/* Filters */}
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6"
                      >
                        <FilterPanel />
                      </motion.div>
                    )}

                    {/* Loading/Error States */}
                    {loading && <p className="text-center py-8">Loading stories...</p>}
                    {error && <p className="text-center py-8 text-destructive">Error: {error}</p>}

                    {/* Facts List */}
                    <InfiniteFactList />

                    {/* Fact Preview Modal */}
                    <FactPreviewModal 
                      fact={selectedFact}
                      open={modalOpen}
                      onClose={handleCloseModal}
                    />
                  </div>
                ) : (
                  // Map View
                  <div className="relative h-screen w-full overflow-hidden">
                    {/* Map Container */}
                    <div ref={mapContainer} className="absolute inset-0" />
                    
                    {/* Map Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Search Bar */}
                      <div className="absolute top-4 left-4 right-4 pointer-events-auto safe-area-padding-top">
                        <Card className="p-3 glass">
                          <SearchBar onQueryChange={handleSearch} />
                        </Card>
                      </div>

                      {/* Bottom Controls */}
                      <div className="absolute bottom-28 left-4 right-4 pointer-events-auto thumb-zone mb-safe">
                        <div className="flex justify-center gap-3">
                          <Button
                            size="lg"
                            variant="secondary"
                            onClick={() => setShowFilters(!showFilters)}
                            className="mobile-button glass"
                          >
                            <Filter className="w-5 h-5 mr-2" />
                            Filter
                          </Button>
                          <Button
                            size="lg"
                            onClick={() => setIsListView(true)}
                            className="mobile-button"
                          >
                            <List className="w-5 h-5 mr-2" />
                            List View
                          </Button>
                        </div>
                      </div>

                      {/* Filter Panel Overlay */}
                      <AnimatePresence>
                        {showFilters && (
                          <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="absolute bottom-40 left-4 right-4 pointer-events-auto"
                          >
                            <Card className="p-4 glass max-h-64 overflow-y-auto">
                              <FilterPanel />
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Fact Preview Modal */}
                      <FactPreviewModal 
                        fact={selectedFact}
                        open={modalOpen}
                        onClose={handleCloseModal}
                      />
                    </div>
                  </div>
                )}
          </div>
        </PullToRefresh>
      </MainLayout>
    </Swipeable>
  );
};