import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAppStore } from '@/stores/appStore';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { CleanSearchBar } from '@/components/ui/clean-search-bar';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useSearchStore } from '@/stores/searchStore';
import { useStoreSync } from '@/hooks/useStoreSync';

export const Explore: React.FC = () => {
  const { 
    facts,
    selectedFact,
    setSelectedFact,
    isLoading,
    error,
    loadMoreFacts,
    initializeData
  } = useDiscoveryStore();
  
  const { query, setQuery } = useSearchStore();
  const { triggerHapticFeedback, handleTouchInteraction } = useAppStore();
  const navigate = useNavigate();
  const { t } = useTranslation('lore');
  
  // Initialize store synchronization
  useStoreSync();

  const [showModal, setShowModal] = useState(false);

  // Initialize data when component mounts
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  // Handle refresh
  const handleRefresh = async () => {
    triggerHapticFeedback('medium');
    handleTouchInteraction();
    
    // Refresh discovery data
    await initializeData();
  };

  // Show modal when fact is selected
  useEffect(() => {
    setShowModal(!!selectedFact);
  }, [selectedFact]);

  return (
    <MainLayout>
      <Helmet>
        <title>Explore Local Lore - Discover Stories Around You</title>
        <meta name="description" content="Discover fascinating local stories, legends, and historical facts. Explore user-submitted lore from around the world and contribute your own knowledge." />
        <link rel="canonical" href="/explore" />
      </Helmet>

      <div className="h-screen w-full bg-gradient-to-br from-background to-muted flex flex-col">
        {/* Enhanced Search Header */}
        <div className="flex-shrink-0 px-4 py-6 bg-background/80 backdrop-blur-sm border-b">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {t('lore:title', 'Explore Local Lore')}
              </h1>
              <p className="text-muted-foreground">
                {t('lore:subtitle', 'Discover fascinating stories and legends from around the world')}
              </p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder={t('lore:searchPlaceholder', 'Search for stories, places, or legends...')}
                className="w-full px-4 py-3 rounded-lg border bg-background"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={query}
              />
            </div>
          </div>
        </div>

        {/* Facts List */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto pb-safe p-4 space-y-4">
            {facts.map((fact) => (
              <div key={fact.id} className="bg-card p-4 rounded-lg border">
                <h3 className="font-semibold">{fact.title}</h3>
                <p className="text-muted-foreground text-sm">{fact.description}</p>
              </div>
            ))}
            {isLoading && <div className="text-center py-4">Loading...</div>}
          </div>
        </div>

        {/* Fact Preview Modal */}
        {showModal && selectedFact && (
          <FactPreviewModal 
            fact={selectedFact}
            open={showModal}
            onClose={() => {
              setSelectedFact(null);
              setShowModal(false);
            }} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Explore;