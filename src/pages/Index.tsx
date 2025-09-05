import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { WelcomeHero } from '@/components/organisms/WelcomeHero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Compass, Search, BookOpen, Star, MapPin, TrendingUp, Users, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useCommunityStats } from '@/hooks/useCommunityStats';

const Index: React.FC = () => {
  console.log('Index page component rendering...');
  const navigate = useNavigate();
  console.log('Navigate hook initialized');
  const { t } = useTranslation('lore');
  console.log('Translation hook initialized');
  const { storiesShared, activeContributors, locationsCovered, isLoading, error } = useCommunityStats();
  console.log('Community stats hook initialized:', { isLoading, error });

  return (
    <MainLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <WelcomeHero />
        
        {/* Main Actions */}
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-6">{t('exploreStories')}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  size="lg"
                  onClick={() => navigate('/explore')}
                  className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Compass className="w-8 h-8" />
                    <span className="text-lg font-semibold">{t('exploreStories')}</span>
                  </div>
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  variant="outline"
                  onClick={() => navigate('/explore')}
                  className="w-full h-24 border-2 hover:bg-accent/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <MapPin className="w-8 h-8" />
                    <span className="text-lg font-semibold">Explore Map</span>
                  </div>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 h-full">
                <Search className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
                <p className="text-muted-foreground mb-4">
                  Find stories by location, category, or keywords with powerful filters.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/search')}
                  className="min-h-[44px]"
                >
                  Search Stories
                </Button>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-6 h-full">
                <BookOpen className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Share Your Story</h3>
                <p className="text-muted-foreground mb-4">
                  Contribute your own local stories and legends to the community.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/submit')}
                  className="min-h-[44px]"
                >
                  Submit Story
                </Button>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-6 h-full">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verified Content</h3>
                <p className="text-muted-foreground mb-4">
                  All stories are community-verified for authenticity and accuracy.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="min-h-[44px]"
                >
                  Learn More
                </Button>
              </Card>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <Card className="p-8 bg-primary/5">
              <h3 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Community Impact
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading community stats...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Unable to load community stats</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {storiesShared.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Stories Shared</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {activeContributors.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Active Contributors</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {locationsCovered.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">Locations Covered</div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;