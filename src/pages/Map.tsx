import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MainLayout } from '@/components/templates/MainLayout';
import { ModernSearchBar } from '@/components/ui/modern-search-bar';
import { ModernBottomBar } from '@/components/ui/modern-bottom-bar';
import { Share, Heart, BookmarkPlus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ViewModeToggle } from '@/components/ui/ViewModeToggle';
import { ScalableMapComponent } from '@/components/map/ScalableMapComponent';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { FactPreviewModal } from '@/components/discovery/FactPreviewModal';
import { FactMarker } from '@/types/map';

export const Map: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const shareLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://maps.google.com/maps?q=${latitude},${longitude}`;
          const shareData = {
            title: 'My Location',
            text: `Check out where I am: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            url: locationUrl,
          };

          try {
            if (navigator.share) {
              await navigator.share(shareData);
            } else {
              await navigator.clipboard.writeText(locationUrl);
              toast({
                title: "Location copied!",
                description: "Your location link has been copied to clipboard.",
              });
            }
          } catch (error) {
            console.error('Error sharing location:', error);
            try {
              await navigator.clipboard.writeText(locationUrl);
              toast({
                title: "Location copied!",
                description: "Your location link has been copied to clipboard.",
              });
            } catch (clipboardError) {
              toast({
                title: "Sharing failed",
                description: "Unable to share or copy location.",
                variant: "destructive",
              });
            }
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location access denied",
            description: "Please enable location access to share your location.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location sharing.",
        variant: "destructive",
      });
    }
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
        {/* Advanced Map with real Supabase data */}
        <ScalableMapComponent
          onFactClick={handleFactClick}
          className="h-full w-full"
          isVisible={true}
        />

        {/* Search Bar - positioned to avoid overlap with map controls */}
        <div className="absolute top-4 left-20 right-16 z-20">
          <ModernSearchBar onSearch={handleSearch} placeholder="Search stories on map..." showLocationButton={true} />
        </div>

        {/* View Mode Toggle */}
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

        {/* Modern Bottom Bar */}
        <ModernBottomBar
          primaryAction={{
            label: "Share My Location",
            icon: <MapPin className="h-4 w-4" />,
            onClick: shareLocation
          }}
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
    </MainLayout>
  );
};