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
  Search as SearchIcon,
  Grid3X3,
  LayoutList,
  Layers
} from 'lucide-react';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { FilterPanel } from '@/components/discovery/FilterPanel';
import { TrendingSection } from '@/components/search/TrendingSection';
import { CleanSearchBar } from '@/components/ui/clean-search-bar';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

type ViewMode = 'grid' | 'list';

export const Explore: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('explore-view-mode');
    return (saved as ViewMode) || 'grid';
  });
  
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
    initializeData,
    setFilters
  } = useDiscoveryStore();

  // Initialize discovery data
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Get user location on load
  useEffect(() => {
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

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('explore-view-mode', mode);
    triggerHapticFeedback('light');
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
          {/* ViewModeToggle - consistent positioning */}
          <div className="absolute top-4 right-4 z-20">
            <ViewModeToggle variant="glass" />
          </div>

          {/* Discovery List View - Always show list */}
          <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
              {/* Header with glass effect */}
              <div className="glass rounded-lg p-4 mb-6 mt-16">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold">Discover Stories</h1>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className="glass border-0 shadow-lg bg-background/80 backdrop-blur-sm"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Filters</span>
                    </Button>
                    
                    {/* View Mode Toggle with glass effect */}
                    <div className="flex rounded-lg border-0 glass bg-background/80 backdrop-blur-sm p-1 shadow-lg">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleViewModeChange('grid')}
                        className="h-8 px-3"
                      >
                        <Grid3X3 className="w-4 h-4" />
                        <span className="sr-only">Grid view</span>
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handleViewModeChange('list')}
                        className="h-8 px-3"
                      >
                        <LayoutList className="w-4 h-4" />
                        <span className="sr-only">List view</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Search Bar - clean version matching homepage style */}
                <CleanSearchBar onQueryChange={handleSearch} />
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
              <InfiniteFactList viewMode={viewMode} />

              {/* Fact Preview Modal */}
              <FactPreviewModal 
                fact={selectedFact}
                open={modalOpen}
                onClose={handleCloseModal}
              />
            </div>
          </div>
        </PullToRefresh>
      </MainLayout>
    </Swipeable>
  );
};