import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useSearchStore } from '@/stores/searchStore';
import { UnifiedMap } from '@/components/map/UnifiedMap';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { CleanSearchBar } from '@/components/ui/clean-search-bar';
import { Button } from '@/components/ui/button';
import { X, Map as MapIcon, List as ListIcon } from 'lucide-react';
import { Fact } from '@/types/map';

export const Hybrid: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const mapRef = useRef<any>(null);
  
  const { 
    facts,
    isLoading,
    initializeData 
  } = useDiscoveryStore();
  
  const { filters } = useSearchStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
          });
        });
        
        setUserLocation([position.coords.longitude, position.coords.latitude]);
      } catch (error) {
        console.warn('Could not get user location:', error);
        setUserLocation([-0.1276, 51.5074]); // Default to London
      }
    };
    
    getUserLocation();
  }, []);

  // Compute filtered facts based on selection
  const filteredFacts = useMemo(() => {
    if (!selectedFactId) return facts;
    return facts.filter(fact => fact.id === selectedFactId);
  }, [facts, selectedFactId]);

  const selectedFact = useMemo(() => {
    return facts.find(fact => fact.id === selectedFactId);
  }, [facts, selectedFactId]);

  // Handle map marker click
  const handleMapFactClick = (fact: Fact) => {
    setSelectedFactId(fact.id);
  };

  // Handle list card click - zoom to location
  const handleListFactClick = (fact: Fact) => {
    setSelectedFactId(fact.id);
    setMapCenter([fact.longitude, fact.latitude]);
    setMapZoom(14);
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedFactId(null);
    setMapCenter(userLocation);
    setMapZoom(2);
  };

  const handleSearch = (query: string) => {
    // Remove direct searchFacts call - this will be handled by store sync
  };

  if (isLoading && facts.length === 0) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const error = null; // Remove error handling for now

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Hybrid View - Interactive Map & Stories | Local Lore</title>
        <meta name="description" content="Explore local stories through both interactive map visualization and detailed list view. Discover hidden gems and cultural heritage in your area." />
        <meta name="keywords" content="hybrid view, interactive map, local stories, cultural heritage, discovery" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Mobile: Tab-based navigation */}
        <div className="lg:hidden">
          <div className="container mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Hybrid Explorer</h1>
            </div>

            {/* View Mode Toggle */}
            <div className="absolute top-4 right-4 z-20">
              <ViewModeToggle variant="glass" />
            </div>

            {/* Search */}
            <CleanSearchBar 
              onQueryChange={handleSearch}
              placeholder="Search stories and locations..."
              className="w-full"
            />

            {/* Selected Fact Info & Reset */}
            {selectedFact && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between animate-fade-in">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFact.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedFact.location_name}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearSelection}
                  className="ml-2 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Tabs for Mobile */}
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'map' ? 'default' : 'outline'}
                onClick={() => setActiveTab('map')}
                className="flex-1"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Map
              </Button>
              <Button
                variant={activeTab === 'list' ? 'default' : 'outline'}
                onClick={() => setActiveTab('list')}
                className="flex-1"
              >
                <ListIcon className="h-4 w-4 mr-2" />
                Lore
              </Button>
            </div>

            {activeTab === 'map' && (
              <div className="h-[60vh] rounded-lg overflow-hidden border border-border">
                <UnifiedMap
                  facts={filteredFacts}
                  center={mapCenter || userLocation}
                  zoom={mapZoom}
                  enableClustering={!selectedFactId}
                  clusterRadius={50}
                  useScalableLoading={true}
                  enableViewportLoading={true}
                  selectedFactId={selectedFactId}
                  onFactClick={handleMapFactClick}
                />
              </div>
            )}

            {activeTab === 'list' && (
              <InfiniteFactList 
                viewMode="list"
                className="h-[60vh]"
                selectedFactId={selectedFactId}
                onFactClick={handleListFactClick}
              />
            )}
          </div>
        </div>

        {/* Desktop/Tablet: Side-by-side layout */}
        <div className="hidden lg:block">
          <div className="container mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Hybrid Explorer</h1>
              <ViewModeToggle variant="glass" />
            </div>

            {/* Search */}
            <CleanSearchBar 
              onQueryChange={handleSearch}
              placeholder="Search stories and locations..."
              className="w-full"
            />

            {/* Selected Fact Info & Reset */}
            {selectedFact && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between animate-fade-in">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFact.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedFact.location_name}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearSelection}
                  className="ml-2 shrink-0"
                >
                  <X className="h-4 w-4 mr-2" />
                  Show All
                </Button>
              </div>
            )}

            {/* Side-by-side layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100vh-220px)]">
              {/* Map - 60% on desktop */}
              <div className="lg:col-span-3 h-full rounded-lg overflow-hidden border border-border">
                <UnifiedMap
                  facts={filteredFacts}
                  center={mapCenter || userLocation}
                  zoom={mapZoom}
                  enableClustering={!selectedFactId}
                  clusterRadius={50}
                  useScalableLoading={true}
                  enableViewportLoading={true}
                  selectedFactId={selectedFactId}
                  onFactClick={handleMapFactClick}
                />
              </div>

              {/* List - 40% on desktop */}
              <div className="lg:col-span-2 h-full">
                <InfiniteFactList 
                  viewMode="list"
                  className="h-full"
                  selectedFactId={selectedFactId}
                  onFactClick={handleListFactClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};