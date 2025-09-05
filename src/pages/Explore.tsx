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
import { useTranslation } from 'react-i18next';

export const Explore: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
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
          {/* Discovery List View - Always show list */}
          <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Discover Stories</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className="shrink-0"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => navigate('/map')}
                    className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <MapIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Map View</span>
                    <span className="sm:hidden">Map</span>
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
          </div>
        </PullToRefresh>
      </MainLayout>
    </Swipeable>
  );
};