import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { ModernSearchBar } from '@/components/ui/modern-search-bar';
import { ModernBottomBar } from '@/components/ui/modern-bottom-bar';
import { Share, Heart, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { List, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { ExperimentalMapSystem } from '@/components/map/ExperimentalMapSystem';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { FactMarker } from '@/types/map';

export const Map: React.FC = () => {
  const navigate = useNavigate();
  
  const {
    selectedFact,
    setSelectedFact,
    filters,
    setFilters,
    searchFacts,
    syncSelectedFact,
    setSyncSelectedFact,
    fetchFactById
  } = useDiscoveryStore();

  const handleFactClick = (fact: FactMarker) => {
    // Convert FactMarker to EnhancedFact for compatibility
    const enhancedFact = {
      id: fact.id,
      title: fact.title,
      description: '', // Will be loaded when modal opens
      latitude: fact.latitude,
      longitude: fact.longitude,
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

  // Handle syncSelectedFact when component mounts or changes
  useEffect(() => {
    if (syncSelectedFact) {
      const loadFact = async () => {
        const fact = await fetchFactById(syncSelectedFact);
        if (fact) {
          setSelectedFact(fact);
        }
      };
      loadFact();
    }
  }, [syncSelectedFact, setSelectedFact, fetchFactById]);

  return (
    <MainLayout>
      <Helmet>
        <title>Explore Map - Discover Stories Around You</title>
        <meta name="description" content="Explore local stories and legends on an interactive map. Discover historical sites, folklore, and hidden gems in your area." />
        <link rel="canonical" href="/map" />
      </Helmet>

      <div className="h-screen w-full relative">
        {/* Experimental map system with React 18 features */}
        <ExperimentalMapSystem
          onFactClick={handleFactClick}
          className="h-full w-full"
          isVisible={true}
        />

        {/* Mobile-optimized Search Bar - improved positioning */}
        <div className="absolute top-4 left-4 right-4 z-20 max-w-md mx-auto sm:max-w-none sm:left-20 sm:right-20">
          <ModernSearchBar onSearch={handleSearch} placeholder="Search stories on map..." showLocationButton={true} />
        </div>

        {/* View Mode Toggle - mobile-first responsive with better spacing */}
        <div className="absolute top-20 right-4 z-20 sm:top-4">
          <ViewModeToggle variant="glass" />
        </div>

        {/* Fact Preview Modal */}
        {selectedFact && (
          <FactPreviewModal
            fact={selectedFact}
            open={true}
            onClose={handleCloseModal}
          />
        )}

        {/* Modern Bottom Bar with safe area padding */}
        <div className="pb-safe-area-inset-bottom">
          <ModernBottomBar
            secondaryActions={[
              {
                label: "Favorite",
                icon: <Heart className="h-4 w-4" />,
                onClick: () => console.log("Favorite clicked")
              },
              {
                label: "Save",
                icon: <BookmarkPlus className="h-4 w-4" />,
                onClick: () => console.log("Save clicked")
              }
            ]}
          />
        </div>
      </div>
    </MainLayout>
  );
};