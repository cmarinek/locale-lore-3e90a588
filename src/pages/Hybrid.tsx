import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { ModernSearchBar } from '@/components/ui/modern-search-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ModernViewToggle } from '@/components/ui/modern-view-toggle';
import { GestureHandler } from '@/components/ui/gesture-handler';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { List, Map as MapIcon, ChevronDown, Filter, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { FactMarker } from '@/types/map';
import { useAppStore } from '@/stores/appStore';
import { FactCard } from '@/components/discovery/FactCard';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { QuickFilters } from '@/components/discovery/QuickFilters';
import { DistanceSortButton } from '@/components/ui/DistanceSortButton';
import { useLocationSorting } from '@/hooks/useLocationSorting';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy-load AdvancedMap to improve initial render
const LazyOptimizedMap = React.lazy(() => import('@/components/ui/OptimizedMap').then(module => ({ default: module.OptimizedMap })));

// Import error boundary
import { ProductionErrorBoundary } from '@/components/common/ErrorBoundary';

export const Hybrid: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation('lore');
  
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [displayedFacts, setDisplayedFacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const {
    facts,
    selectedFact,
    setSelectedFact,
    filters,
    setFilters,
    searchFacts,
    initializeData,
    loading,
    setMapCenter,
    setSyncSelectedFact
  } = useDiscoveryStore();
  
  const { sortFactsByDistance, isLoadingLocation, formatDistance } = useLocationSorting();
  const { triggerHapticFeedback } = useAppStore();

  // Initialize data and sort by distance by default
  useEffect(() => {
    initializeData();
    getUserLocation();
  }, []);

  // Listen for custom events to switch to map tab
  useEffect(() => {
    const handleSwitchToMapTab = () => {
      setActiveTab('map');
      triggerHapticFeedback('light');
    };

    window.addEventListener('switch-to-map-tab', handleSwitchToMapTab);
    return () => window.removeEventListener('switch-to-map-tab', handleSwitchToMapTab);
  }, [triggerHapticFeedback]);

  // Update displayed facts when facts change, sort by distance by default
  useEffect(() => {
    const sortAndSetFacts = async () => {
      if (facts.length > 0 && !isLoadingLocation) {
        try {
          const sortedFacts = await sortFactsByDistance(facts);
          setDisplayedFacts(sortedFacts);
        } catch (error) {
          console.error('Failed to sort by distance:', error);
          setDisplayedFacts(facts);
        }
      } else {
        setDisplayedFacts(facts);
      }
    };
    
    sortAndSetFacts();
  }, [facts, isLoadingLocation, sortFactsByDistance]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    triggerHapticFeedback('light');
    
    try {
      await initializeData();
      await getUserLocation();
      toast.success('Content refreshed', {
        duration: 2000,
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--primary))',
        }
      });
    } catch (error) {
      toast.error('Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [initializeData, triggerHapticFeedback]);

  const getUserLocation = async () => {
    try {
      const { locationService } = await import('@/utils/location');
      const result = await locationService.getDeviceLocation();
      setUserLocation(result.coordinates);
    } catch (error) {
      console.error('Failed to get location:', error);
      setUserLocation([-0.1276, 51.5074]); // London fallback
    }
  };

  const handleFactClick = (fact: any) => {
    // Trigger haptic feedback for better UX
    triggerHapticFeedback('light');
    
    // Center map on the fact location with smooth animation
    if (fact.latitude && fact.longitude) {
      setMapCenter([fact.longitude, fact.latitude]);
      setSyncSelectedFact(fact.id);
      
      // Show toast notification with subtle feedback
      toast.success(`Map centered on ${fact.title}`, {
        duration: 2000,
        style: {
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--primary))',
          color: 'hsl(var(--foreground))'
        }
      });
      
      // Switch to map view on mobile for immediate visual feedback
      if (isMobile) {
        setTimeout(() => setActiveTab('map'), 300);
      }
    }

    // Convert fact to enhanced format for modal compatibility
    const enhancedFact = {
      id: fact.id,
      title: fact.title,
      description: fact.description || '',
      latitude: fact.latitude,
      longitude: fact.longitude,
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
  };

  const handleMapFactClick = (fact: FactMarker) => {
    // Convert FactMarker to EnhancedFact for compatibility
    const enhancedFact = {
      id: fact.id,
      title: fact.title,
      description: '', // Will be loaded when modal opens
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
    setFilters({ search: query });
    searchFacts(query);
  };

  const handleCloseModal = () => {
    setSelectedFact(null);
    setSyncSelectedFact(null);
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

  return (
    <MainLayout>
      <Helmet>
        <title>Hybrid View - Stories & Map</title>
        <meta name="description" content="Explore local stories and legends with both map and list views in one place." />
        <link rel="canonical" href="/hybrid" />
      </Helmet>


      <div className="h-screen w-full flex flex-col">
        {/* Mobile-optimized Header - sticky with backdrop blur */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border/50">
          {/* Top spacing for mobile status bar */}
          <div className="h-safe-top" />

          {/* Search Section and View Toggle */}
          <div className="px-4 pt-4 pb-3 space-y-3">
            <div className="glass rounded-xl p-3">
              <ModernSearchBar 
                onSearch={handleSearch} 
                placeholder={isMobile ? "Search stories..." : "Search stories and locations..."}
                className="text-base" // Larger text for mobile
              />
            </div>
            
            {/* View Toggle - accessible on all screen sizes */}
            <div className="flex justify-center">
              <ModernViewToggle
                activeView={activeTab}
                onViewChange={setActiveTab}
                className="w-fit"
              />
            </div>
          </div>
          
          {/* Mobile Filters Toggle */}
          {isMobile && (
            <div className="px-4 pb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full justify-between h-10 touch-friendly"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                  {Object.values(filters).some(v => v && v !== '') && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          )}

          {/* Collapsible Filters */}
          <div className={`transition-all duration-300 ease-out overflow-hidden ${
            (showFilters || !isMobile) ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-4 pb-4">
              <QuickFilters 
                filters={filters} 
                onFiltersChange={setFilters}
                onNearbyClick={async () => {
                  try {
                    const sortedFacts = await sortFactsByDistance(facts);
                    setDisplayedFacts(sortedFacts);
                  } catch (error) {
                    console.error('Failed to sort by distance:', error);
                  }
                }}
                className="gap-2"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isMobile || (typeof window !== 'undefined' && window.innerWidth < 1024) ? (
          /* Mobile: Touch-optimized tab interface with pull-to-refresh */
          <div className="flex-1 flex flex-col">
            {/* Mobile Tab Navigation - optimized for thumb reach */}
            <div className="flex-1 min-h-0 flex flex-col">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'map')} className="flex-1 min-h-0 flex flex-col">

                <div className="flex-1 min-h-0">
                  {/* Stories List with Pull-to-Refresh */}
                  <TabsContent value="list" className="h-full data-[state=inactive]:hidden">
                    <PullToRefresh 
                      onRefresh={handleRefresh}
                      className="h-full"
                    >
                      <GestureHandler 
                        onSwipeLeft={handleSwipeLeft}
                        onSwipeRight={handleSwipeRight}
                        className="h-full"
                        dragAxis="x"
                      >
                        <div className="h-full overflow-auto px-4 pb-safe-bottom">
                          {/* Status Bar */}
                          <div className="flex items-center justify-between py-3 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
                            <Badge variant="outline" className="text-xs font-medium">
                              {userLocation ? `${displayedFacts.length} nearby` : `${displayedFacts.length} stories`}
                            </Badge>
                            {userLocation && (
                              <DistanceSortButton facts={displayedFacts} onSorted={setDisplayedFacts} />
                            )}
                          </div>
                          
                          {/* Loading State */}
                          {loading && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                              <p className="text-sm text-muted-foreground">Finding stories...</p>
                            </div>
                          )}
                          
                          {/* Empty State */}
                          {!loading && displayedFacts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3">
                              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                <MapPin className="w-8 h-8 text-muted-foreground" />
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-sm">No stories found</p>
                                <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Stories Grid - optimized for mobile touch */}
                          <div className="space-y-3 pb-4">
                            {displayedFacts.map((fact, index) => (
                              <div 
                                key={fact.id} 
                                onClick={() => handleFactClick(fact)} 
                                className="cursor-pointer transform active:scale-98 transition-transform duration-150"
                                style={{ 
                                  animationDelay: `${index * 50}ms`,
                                  animation: 'fade-in 0.3s ease-out forwards'
                                }}
                              >
                                <FactCard 
                                  fact={{
                                    ...fact,
                                    distanceText: fact.distance ? formatDistance(fact.distance) : undefined
                                  }} 
                                  viewMode="list" 
                                  className="bg-card/80 backdrop-blur-sm hover:bg-card/90 active:bg-card transition-all duration-200 touch-manipulation" 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </GestureHandler>
                    </PullToRefresh>
                  </TabsContent>

                  {/* Map View - lazy loaded and optimized */}
                  <TabsContent value="map" forceMount className="h-full data-[state=inactive]:hidden">
                    <div className="relative h-full">
                      <ProductionErrorBoundary>
                        <React.Suspense fallback={
                          <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                            <div className="flex flex-col items-center space-y-4 p-6 bg-card/90 backdrop-blur-sm rounded-lg shadow-lg">
                              <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                                <span className="text-sm font-medium">Preparing map...</span>
                              </div>
                              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full animate-pulse"></div>
                              </div>
                              <p className="text-xs text-muted-foreground text-center">Setting up interactive experience</p>
                            </div>
                          </div>
                        }>
                          <LazyOptimizedMap
                          onFactClick={handleMapFactClick} 
                          className="h-full w-full"
                          isVisible={activeTab === 'map'}
                          initialCenter={[centerLocation.lng, centerLocation.lat]} 
                          initialZoom={isMobile ? 12 : 10}
                          showBuiltInSearch={false} 
                        />
                       </React.Suspense>
                      </ProductionErrorBoundary>
                     </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        ) : (
          /* Desktop: Side-by-side layout (unchanged for now) */
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
              
              <div className="flex-1 overflow-auto">
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
              </div>
            </div>

            {/* Map - Desktop: Right main area */}
            <div className="flex-1 relative">
              <React.Suspense fallback={<div className="absolute inset-0 grid place-items-center text-muted-foreground animate-fade-in">Loading map...</div>}>
                <LazyOptimizedMap 
                  onFactClick={handleMapFactClick} 
                  className="h-full w-full" 
                  initialCenter={[centerLocation.lng, centerLocation.lat]} 
                  initialZoom={isMobile ? 12 : 10}
                  showBuiltInSearch={false}
                  isVisible={true}
                />
              </React.Suspense>
            </div>
          </div>
        )}

        {/* Mobile-Optimized Fact Preview Modal */}
        {selectedFact && (
          <FactPreviewModal 
            fact={selectedFact} 
            open={true} 
            onClose={handleCloseModal}
          />
        )}
        
        {/* Mobile Bottom Safe Area */}
        <div className="h-safe-bottom bg-background" />
      </div>
    </MainLayout>
  );
};