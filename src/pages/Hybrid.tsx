import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useSearchStore } from '@/stores/searchStore';
import { UnifiedMap } from '@/components/map/UnifiedMap';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { CleanSearchBar } from '@/components/ui/clean-search-bar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, List } from 'lucide-react';

export const Hybrid: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  
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
        <div className="container mx-auto p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <ViewModeToggle />
            <h1 className="text-2xl font-bold">Hybrid Explorer</h1>
          </div>

          {/* Search */}
          <CleanSearchBar 
            onQueryChange={handleSearch}
            placeholder="Search stories and locations..."
            className="w-full"
          />

          {/* Tabs for Map/List Toggle */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'map' | 'list')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-4">
              <div className="h-[70vh] rounded-lg overflow-hidden border border-border">
                <UnifiedMap
                  facts={facts}
                  center={userLocation}
                  enableClustering={true}
                  clusterRadius={50}
                  useScalableLoading={true}
                  enableViewportLoading={true}
                  onFactClick={(fact) => {
                    console.log('Selected fact:', fact);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              <InfiniteFactList 
                viewMode="list"
                className="h-[70vh] overflow-y-auto"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};