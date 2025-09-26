/**
 * Enhanced map page using scalable fact service
 * Replaces the original Map page with viewport-based loading
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { ModernSearchBar } from '@/components/ui/modern-search-bar';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { UnifiedMap } from '@/components/map/UnifiedMap';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useScalableFacts } from '@/hooks/useScalableFacts';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers, Clock } from 'lucide-react';

export const EnhancedMap: React.FC = () => {
  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const { selectedFact, setSelectedFact, filters, setFilters } = useDiscoveryStore();
  
  const {
    viewportFacts,
    loading,
    error,
    metrics,
    loadFactsForViewport,
    handleBoundsChange,
    refreshViewport,
    searchInViewport
  } = useScalableFacts({
    autoLoad: false, // We'll load when map bounds are set
    defaultZoom: 2
  });

  const handleFactClick = (fact: any) => {
    // Convert fact to enhanced format for modal compatibility
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
        color: '#3B82F6',
        category_translations: [{
          name: fact.category || 'Unknown',
          language_code: 'en'
        }]
      }
    };
    setSelectedFact(enhancedFact);
    setSelectedFactId(fact.id);
  };

  const handleSearch = async (query: string) => {
    setFilters({ search: query });
    if (query.trim()) {
      await searchInViewport(query);
    } else {
      refreshViewport();
    }
  };

  const handleCloseModal = () => {
    setSelectedFact(null);
    setSelectedFactId(null);
  };

  // Convert facts to ScalableFact format
  const scalableFacts = viewportFacts.map(fact => ({
    id: fact.id,
    title: fact.title,
    latitude: fact.latitude,
    longitude: fact.longitude,
    category: fact.categories?.slug || 'unknown',
    vote_count_up: fact.vote_count_up || 0,
    properties: fact
  }));

  return (
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
      <MainLayout>
        <Helmet>
          <title>Explore Map - Discover Stories Around You</title>
          <meta name="description" content="Explore local stories and legends on an interactive map. Discover historical sites, folklore, and hidden gems in your area with intelligent viewport loading." />
          <link rel="canonical" href="/map" />
        </Helmet>

        <div className="h-screen w-full relative">
          {/* Scalable Map with Performance Monitoring */}
          <ErrorBoundary 
            fallback={
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <div className="text-center space-y-4">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-muted-foreground">Loading interactive map...</p>
                  <p className="text-sm text-muted-foreground/70">Optimized for millions of facts</p>
                </div>
              </div>
            }
          >
            <UnifiedMap
              useScalableLoading={true}
              enableClustering={true}
              enableViewportLoading={true}
              enablePerformanceMetrics={true}
              center={[0, 20]}
              zoom={2}
              style="light"
              clusterRadius={50}
              onFactClick={handleFactClick}
              onBoundsChange={handleBoundsChange}
            />
          </ErrorBoundary>

          {/* Search Bar */}
          <div className="absolute top-4 left-4 right-16 z-20 max-w-md mx-auto sm:max-w-none sm:left-32 sm:right-56">
            <ModernSearchBar 
              onSearch={handleSearch} 
              placeholder="Search stories on map..." 
              showLocationButton={true}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="absolute top-4 right-4 z-20">
            <ViewModeToggle variant="glass" />
          </div>

          {/* Performance Metrics */}
          <Card className="absolute bottom-4 left-4 p-3 bg-background/90 backdrop-blur z-20">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{metrics.totalFacts} facts</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{metrics.loadTime}ms</span>
              </div>
              {metrics.cacheHit && (
                <Badge variant="secondary" className="text-xs px-1">
                  Cached
                </Badge>
              )}
              {loading && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="absolute top-16 left-4 right-4 p-3 bg-destructive/10 border-destructive/20 z-20">
              <div className="text-destructive text-sm">
                Error loading facts: {error}
                <button 
                  onClick={refreshViewport}
                  className="ml-2 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            </Card>
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
    </ErrorBoundary>
  );
};

export default EnhancedMap;