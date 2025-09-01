import React, { useEffect, useRef, useState } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { FilterPanel } from '@/components/discovery/FilterPanel';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Swipeable } from '@/components/ui/swipeable';
import { Map, List, MapPin, Navigation, Locate, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const { triggerHapticFeedback, handleTouchInteraction, mobile } = useAppStore();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isListView, setIsListView] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tempToken, setTempToken] = useState('');

  // Get Mapbox token from Supabase Edge Function
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setShowTokenInput(true);
        }
      } catch (error) {
        console.log('Mapbox token not configured, showing input');
        setShowTokenInput(true);
      }
    };

    getMapboxToken();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.log('Location access denied, using default location');
          // Default to San Francisco
          setUserLocation([-122.4194, 37.7749]);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // Default location if geolocation not supported
      setUserLocation([-122.4194, 37.7749]);
    }
  }, []);

  // Initialize map when token and location are available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !userLocation) return;

    // Set mapbox access token
    mapboxgl.accessToken = mapboxToken;
    
    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: userLocation,
      zoom: 12, // 5-mile zoom level approximately
      pitch: 45,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocate control
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });
    
    map.current.addControl(geolocate, 'top-right');

    // Add user location marker
    new mapboxgl.Marker({ color: '#007bff' })
      .setLngLat(userLocation)
      .addTo(map.current);

    // Add sample fact markers (in a real app, these would come from your database)
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

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, userLocation]);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    triggerHapticFeedback('medium');
  };

  const handleSwipeLeft = () => {
    navigate('/discover');
    handleTouchInteraction('swipe');
  };

  const handleSwipeRight = () => {
    navigate('/search');
    handleTouchInteraction('swipe');
  };

  const toggleView = () => {
    setIsListView(!isListView);
    handleTouchInteraction('tap');
  };

  const handleTokenSubmit = () => {
    if (tempToken.trim()) {
      setMapboxToken(tempToken.trim());
      setShowTokenInput(false);
    }
  };

  if (showTokenInput) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Mapbox Token Required</h2>
              <p className="text-muted-foreground text-sm">
                To use the map, please enter your Mapbox public token. 
                Get yours at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
              </p>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={tempToken}
                onChange={(e) => setTempToken(e.target.value)}
                placeholder="pk.eyJ1Ijoi..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={handleTokenSubmit}
                className="w-full mobile-button"
                disabled={!tempToken.trim()}
              >
                Use Token
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/discover')}
                className="w-full mobile-button"
              >
                Skip to Discover Page
              </Button>
            </div>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <Swipeable
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
    >
      <MainLayout>
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="relative h-screen w-full overflow-hidden">
            {/* Map View */}
            <AnimatePresence mode="wait">
              {!isListView ? (
                <motion.div
                  key="map"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  {/* Map Container */}
                  <div ref={mapContainer} className="absolute inset-0" />
                  
                  {/* Map Overlay UI */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top Search Bar */}
                    <div className="absolute top-4 left-4 right-4 pointer-events-auto safe-area-padding-top">
                      <Card className="p-3 glass">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-primary" />
                          <span className="flex-1 text-sm font-medium">Exploring Your Area (5 miles)</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition((position) => {
                                  const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
                                  setUserLocation(coords);
                                  map.current?.flyTo({ center: coords, zoom: 12 });
                                });
                              }
                            }}
                            className="mobile-button"
                          >
                            <Locate className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-20 left-4 right-4 pointer-events-auto thumb-zone">
                      <div className="flex justify-between items-end gap-4">
                        {/* Filter Button */}
                        <Button
                          size="lg"
                          variant="outline"
                          className="glass mobile-button"
                          onClick={() => {
                            // Open filter modal or navigate to filter page
                            handleTouchInteraction('tap');
                          }}
                        >
                          <Filter className="w-5 h-5" />
                        </Button>

                        {/* View Toggle */}
                        <Button
                          size="lg"
                          onClick={toggleView}
                          className="glass bg-primary hover:bg-primary/90 mobile-button"
                        >
                          <List className="w-5 h-5 mr-2" />
                          List View
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* List View */
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute inset-0 bg-background"
                >
                  <div className="h-full overflow-auto">
                    {/* List Header */}
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b safe-area-padding-top">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h1 className="text-2xl font-bold">Nearby Stories</h1>
                          <Button
                            variant="outline"
                            onClick={toggleView}
                            className="mobile-button"
                          >
                            <Map className="w-4 h-4 mr-2" />
                            Map View
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Navigation className="w-4 h-4" />
                          <span>Within 5 miles of your location</span>
                        </div>
                      </div>
                    </div>

                    {/* Filter Panel */}
                    <div className="p-4 border-b">
                      <FilterPanel />
                    </div>

                    {/* Facts List */}
                    <div className="p-4">
                      <InfiniteFactList />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </PullToRefresh>
      </MainLayout>
    </Swipeable>
  );
};