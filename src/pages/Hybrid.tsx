import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { CleanSearchBar } from '@/components/ui/clean-search-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GestureHandler } from '@/components/ui/gesture-handler';
import { List, Map as MapIcon, Layers, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdvancedMap from '@/components/ui/AdvancedMap';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { FactMarker } from '@/types/map';
import { useAppStore } from '@/stores/appStore';
import { FactCard } from '@/components/discovery/FactCard';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { QuickFilters } from '@/components/discovery/QuickFilters';
import { DistanceSortButton } from '@/components/ui/DistanceSortButton';
import { useLocationSorting } from '@/hooks/useLocationSorting';
import { useIsMobile } from '@/hooks/use-mobile';
export const Hybrid: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    t
  } = useTranslation('lore');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [displayedFacts, setDisplayedFacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const {
    formatDistance
  } = useLocationSorting();
  const {
    facts,
    selectedFact,
    setSelectedFact,
    filters,
    setFilters,
    searchFacts,
    initializeData,
    loading
  } = useDiscoveryStore();
  const {
    triggerHapticFeedback
  } = useAppStore();

  // Initialize data
  useEffect(() => {
    initializeData();
    getUserLocation();
  }, []); // Remove initializeData from deps to prevent infinite loop

  // Update displayed facts when facts change
  useEffect(() => {
    setDisplayedFacts(facts);
  }, [facts]);
  const getUserLocation = async () => {
    try {
      const {
        locationService
      } = await import('@/utils/location');
      const result = await locationService.getDeviceLocation();
      setUserLocation(result.coordinates);
    } catch (error) {
      console.error('Failed to get location:', error);
      setUserLocation([-0.1276, 51.5074]); // London fallback
    }
  };
  const handleFactClick = (fact: any) => {
    // Convert fact to FactMarker format for map compatibility
    if (fact.latitude && fact.longitude) {
      const enhancedFact = {
        id: fact.id,
        title: fact.title,
        description: fact.description || '',
        latitude: fact.latitude,
        longitude: fact.longitude,
        category: fact.category || fact.categories?.slug || 'unknown',
        verified: fact.verified || fact.status === 'verified',
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
          slug: 'unknown',
          icon: '📍',
          color: '#3B82F6',
          category_translations: [{
            name: 'Unknown',
            language_code: 'en'
          }]
        }
      };
      setSelectedFact(enhancedFact);
    }
  };
  const handleMapFactClick = (fact: FactMarker) => {
    // Convert FactMarker to EnhancedFact for compatibility
    const enhancedFact = {
      id: fact.id,
      title: fact.title,
      description: '',
      // Will be loaded when modal opens
      latitude: fact.latitude,
      longitude: fact.longitude,
      category: fact.category,
      verified: fact.verified,
      vote_count_up: fact.voteScore > 0 ? fact.voteScore : 0,
      vote_count_down: fact.voteScore < 0 ? Math.abs(fact.voteScore) : 0,
      author_id: '',
      category_id: '',
      status: fact.verified ? 'verified' as const : 'pending' as const,
      location_name: '',
      media_urls: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: '',
        username: fact.authorName || 'Anonymous',
        avatar_url: null
      },
      categories: {
        slug: fact.category,
        icon: '📍',
        color: '#3B82F6',
        category_translations: [{
          name: fact.category,
          language_code: 'en'
        }]
      }
    };
    setSelectedFact(enhancedFact);
  };
  const handleSearch = (query: string) => {
    setFilters({
      search: query
    });
    searchFacts(query);
  };
  const handleCloseModal = () => {
    setSelectedFact(null);
  };
  const handleViewToggle = () => {
    triggerHapticFeedback('light');
    // Cycle: Hybrid → List → Map → Hybrid
    navigate('/explore');
  };

  const handleSwipeLeft = () => {
    if (isMobile && activeTab === 'list') {
      setActiveTab('map');
      triggerHapticFeedback('light');
    }
  };

  const handleSwipeRight = () => {
    if (isMobile && activeTab === 'map') {
      setActiveTab('list');
      triggerHapticFeedback('light');
    }
  };
  const centerLocation = userLocation ? {
    lat: userLocation[0],
    lng: userLocation[1]
  } : {
    lat: 51.5074,
    lng: -0.1276
  };
  return <MainLayout>
      <Helmet>
        <title>Hybrid View - Stories & Map</title>
        <meta name="description" content="Explore local stories and legends with both map and list views in one place." />
        <link rel="canonical" href="/hybrid" />
      </Helmet>

      {/* ViewModeToggle - consistent positioning */}
      <div className="absolute top-4 right-4 z-20">
        <ViewModeToggle variant="glass" />
      </div>

      <div className="h-screen w-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className={`glass rounded-lg p-4 mb-4 ${isMobile ? 'mt-8' : 'mt-12'} my-[40px] py-0`}>
            {/* Search - clean version matching homepage style */}
            <CleanSearchBar onQueryChange={handleSearch} />
          </div>
          
          {/* Quick Filters - Collapsible on mobile */}
          <div className={`mt-3 ${isMobile ? 'max-h-16 overflow-hidden' : ''}`}>
            <QuickFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Content Area */}
        {isMobile ? (
          /* Mobile: Tab-based interface */
          <div className="flex-1 flex flex-col min-h-0">
            <GestureHandler 
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              className="flex-1 flex flex-col min-h-0"
            >
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'map')} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2 mx-4 mt-2 mb-3">
                  <TabsTrigger value="list" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    <span>Stories ({displayedFacts.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4" />
                    <span>Map</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="flex-1 flex flex-col min-h-0 px-4 mt-0">
                  <div className="flex items-center justify-between mb-3 py-2">
                    <Badge variant="outline" className="text-xs">
                      {userLocation ? 'Near you' : 'Explore'}
                    </Badge>
                  </div>
                  
                  <ScrollArea className="flex-1">
                    <div className="space-y-3 pb-4">
                      {loading && (
                        <div className="text-center py-8 text-muted-foreground">
                          Loading stories...
                        </div>
                      )}
                      
                      {!loading && displayedFacts.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No stories found
                        </div>
                      )}
                      
                      {displayedFacts.map(fact => (
                        <div key={fact.id} onClick={() => handleFactClick(fact)} className="cursor-pointer">
                          <FactCard 
                            fact={{
                              ...fact,
                              distanceText: fact.distance ? formatDistance(fact.distance) : undefined
                            }} 
                            viewMode="list" 
                            className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors" 
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="map" className="flex-1 min-h-0 mt-0">
                  <div className="h-full relative">
                    <AdvancedMap 
                      onFactClick={handleMapFactClick} 
                      className="h-full w-full rounded-lg mx-4" 
                      initialCenter={[centerLocation.lng, centerLocation.lat]} 
                      showBuiltInSearch={false} 
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </GestureHandler>
          </div>
        ) : (
          /* Desktop: Side-by-side layout (unchanged) */
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {/* Facts List - Desktop: Left sidebar */}
            <div className="lg:w-1/3 flex-shrink-0 flex flex-col border-r border-border/50">
              <div className="p-4 border-b border-border/50 py-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">
                    {displayedFacts.length} {displayedFacts.length === 1 ? 'Story' : 'Stories'}
                  </h3>
                  <Badge variant="outline">
                    {userLocation ? 'Near you' : 'Explore'}
                  </Badge>
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {loading && (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading stories...
                    </div>
                  )}
                  
                  {!loading && displayedFacts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No stories found
                    </div>
                  )}
                  
                  {displayedFacts.map(fact => (
                    <div key={fact.id} onClick={() => handleFactClick(fact)} className="cursor-pointer">
                      <FactCard 
                        fact={{
                          ...fact,
                          distanceText: fact.distance ? formatDistance(fact.distance) : undefined
                        }} 
                        viewMode="list" 
                        className="bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors" 
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Map - Desktop: Right main area */}
            <div className="flex-1 relative">
              <AdvancedMap 
                onFactClick={handleMapFactClick} 
                className="h-full w-full" 
                initialCenter={[centerLocation.lng, centerLocation.lat]} 
                showBuiltInSearch={false} 
              />
            </div>
          </div>
        )}

        {/* Fact Preview Modal */}
        {selectedFact && <FactPreviewModal fact={selectedFact} open={true} onClose={handleCloseModal} />}
      </div>
    </MainLayout>;
};