import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { SearchBar } from '@/components/discovery/SearchBar';
import { Button } from '@/components/ui/button';
import { Loader2, List, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import { toast } from 'sonner';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { locationService } from '@/utils/location';

export const Map: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  
  const {
    selectedFact,
    setSelectedFact,
    filters,
    setFilters,
    searchFacts
  } = useDiscoveryStore();

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Get Mapbox token from Supabase edge function
        const response = await fetch('https://mwufulzthoqrwbwtvogx.supabase.co/functions/v1/get-mapbox-token');
        let mapboxToken = '';
        
        if (response.ok) {
          const data = await response.json();
          mapboxToken = data.token;
        } else {
          console.warn('Failed to fetch Mapbox token from API, using fallback');
        }

        if (!mapboxToken && !mapboxgl.accessToken) {
          console.error('No Mapbox token available');
          setIsLoading(false);
          return;
        }

        if (mapboxToken) {
          mapboxgl.accessToken = mapboxToken;
        }

        // Get user location
        const locationResult = await locationService.getDeviceLocation();
        const location = {
          lat: locationResult.coordinates[1],
          lng: locationResult.coordinates[0]
        };
        setUserLocation(location);

        if (mapContainer.current && !map.current) {
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [location.lng, location.lat],
            zoom: 12,
            attributionControl: false
          });

          // Add navigation controls
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          // Add geolocate control
          map.current.addControl(
            new mapboxgl.GeolocateControl({
              positionOptions: {
                enableHighAccuracy: true
              },
              trackUserLocation: true,
              showUserHeading: true
            }),
            'top-right'
          );

          // Add user location marker
          new mapboxgl.Marker({ color: '#ef4444' })
            .setLngLat([location.lng, location.lat])
            .setPopup(new mapboxgl.Popup().setText('Your Location'))
            .addTo(map.current);

          // Add sample markers for demonstration
          const sampleLocations = [
            { lng: location.lng + 0.01, lat: location.lat + 0.01, title: 'Historic Building', type: 'history' },
            { lng: location.lng - 0.01, lat: location.lat + 0.005, title: 'Local Legend', type: 'folklore' },
            { lng: location.lng + 0.005, lat: location.lat - 0.01, title: 'Hidden Gem', type: 'local' }
          ];

          sampleLocations.forEach((loc, index) => {
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <h3 class="font-semibold">${loc.title}</h3>
                <p class="text-sm text-gray-600">${loc.type}</p>
                <button class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">Learn More</button>
              </div>`
            );

            new mapboxgl.Marker({ color: '#3b82f6' })
              .setLngLat([loc.lng, loc.lat])
              .setPopup(popup)
              .addTo(map.current!);
          });

          map.current.on('load', () => {
            setIsLoading(false);
          });
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const handleSearch = (query: string) => {
    setFilters({ search: query });
    searchFacts(query);
  };

  const handleCloseModal = () => {
    setSelectedFact(null);
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Explore Map - Discover Stories Around You</title>
        <meta name="description" content="Explore local stories and legends on an interactive map. Discover historical sites, folklore, and hidden gems in your area." />
        <link rel="canonical" href="/map" />
      </Helmet>

      <div className="h-screen w-full relative">
        {/* Map Container */}
        <div 
          ref={mapContainer} 
          className="h-full w-full"
          style={{ position: 'relative' }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading interactive map...</p>
            </div>
          </div>
        )}

        {/* Search Overlay */}
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="glass rounded-lg p-4">
            <SearchBar
              onQueryChange={handleSearch}
              placeholder="Search stories on map..."
            />
          </div>
        </div>

        {/* Switch to List View Button */}
        <div className="absolute top-4 right-4 z-20">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/explore')}
            className="glass border-0 shadow-lg"
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
        </div>

        {/* Location Info */}
        {userLocation && (
          <div className="absolute bottom-4 left-4 z-20">
            <div className="glass rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Navigation className="w-4 h-4" />
                <span>
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
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
  );
};