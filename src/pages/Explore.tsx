import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import MapShowcase from '@/components/showcase/MapShowcase';
import { InfiniteFactList } from '@/components/discovery/InfiniteFactList';
import { FilterPanel } from '@/components/discovery/FilterPanel';
import { SearchBar } from '@/components/discovery/SearchBar';
import { TrendingSection } from '@/components/search/TrendingSection';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { Swipeable } from '@/components/ui/swipeable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Compass, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const { triggerHapticFeedback, handleTouchInteraction, mobile } = useAppStore();

  const handleRefresh = async () => {
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    triggerHapticFeedback('medium');
  };

  const handleSwipeLeft = () => {
    navigate('/search');
    handleTouchInteraction('swipe');
  };

  const handleSwipeRight = () => {
    navigate('/profile');
    handleTouchInteraction('swipe');
  };

  return (
    <Swipeable
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
    >
      <MainLayout>
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 overscroll-contain">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-border">
              <div className="container mx-auto px-4 py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center max-w-4xl mx-auto"
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                    Explore Local Lore
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Discover fascinating stories, legends, and historical facts from around the world. 
                    Explore by location, search for specific topics, or browse trending content.
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <Button 
                      size="lg" 
                      onClick={() => {
                        navigate('/search');
                        handleTouchInteraction('tap');
                      }}
                      className="bg-primary hover:bg-primary/90 mobile-button"
                    >
                      <Compass className="w-5 h-5 mr-2" />
                      Advanced Search
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => {
                        navigate('/submit');
                        handleTouchInteraction('tap');
                      }}
                      className="mobile-button"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Share Your Story
                    </Button>
                  </div>

                  {/* Quick Search */}
                  <div className="max-w-2xl mx-auto">
                    <SearchBar 
                      onQueryChange={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)}
                      placeholder="Search for stories, places, or legends..."
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="container mx-auto px-4 py-8">
              <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 order-2 lg:order-1">
                  <div className="space-y-6 sticky top-6">
                    {/* Filters */}
                    <FilterPanel />
                    
                    {/* Trending */}
                    <TrendingSection 
                      onLocationClick={(location) => 
                        navigate(`/search?location=${location.lat},${location.lng}`)
                      }
                      onFactClick={(factId) => navigate(`/fact/${factId}`)}
                    />

                    {/* Quick Stats */}
                    <Card className="p-6 bg-card/50 backdrop-blur">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Discovery Stats
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Facts</span>
                          <span className="font-medium">12,847</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Verified Stories</span>
                          <span className="font-medium">8,921</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Locations</span>
                          <span className="font-medium">2,134</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contributors</span>
                          <span className="font-medium">3,456</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 order-1 lg:order-2">
                  <div className="space-y-8">
                    {/* Interactive Map */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="p-6 bg-card/50 backdrop-blur">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-semibold flex items-center gap-2">
                            <MapPin className="w-6 h-6 text-primary" />
                            Interactive Map
                          </h2>
                          <Button variant="outline" size="sm" className="mobile-button">
                            Fullscreen
                          </Button>
                        </div>
                        <div className="h-96 rounded-lg overflow-hidden">
                          <MapShowcase />
                        </div>
                      </Card>
                    </motion.div>

                    {/* Facts Feed */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold">Latest Discoveries</h2>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="mobile-button">
                            Filter
                          </Button>
                          <Button variant="outline" size="sm" className="mobile-button">
                            Sort
                          </Button>
                        </div>
                      </div>
                      <InfiniteFactList />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PullToRefresh>
      </MainLayout>
    </Swipeable>
  );
};