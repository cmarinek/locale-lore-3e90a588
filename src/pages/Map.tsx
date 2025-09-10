import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { SearchBar } from '@/components/discovery/SearchBar';
import { Button } from '@/components/ui/button';
import { List, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import AdvancedMap from '@/components/ui/AdvancedMap';
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
    searchFacts
  } = useDiscoveryStore();

  const handleFactClick = (fact: FactMarker) => {
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
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Explore Map - Discover Stories Around You</title>
        <meta name="description" content="Explore local stories and legends on an interactive map. Discover historical sites, folklore, and hidden gems in your area." />
        <link rel="canonical" href="/map" />
      </Helmet>

      <div className="h-screen w-full relative">
        {/* Advanced Map with real Supabase data */}
        <AdvancedMap
          onFactClick={handleFactClick}
          className="h-full w-full"
        />


        {/* View Mode Toggle Button */}
        <div className="absolute top-4 right-4 z-20">
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
      </div>
    </MainLayout>
  );
};