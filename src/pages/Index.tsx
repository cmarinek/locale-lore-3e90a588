import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { WelcomeHero } from '@/components/organisms/WelcomeHero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Compass, Search, BookOpen, Star, MapPin, TrendingUp, Users, Shield, Loader2, Sparkles, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthProvider';
import { HeroSearchBar } from '@/components/ui/hero-search-bar';
const Index: React.FC = () => {
  console.log('📄 INDEX: Component rendering...');
  try {
    console.log('📄 INDEX: Initializing hooks...');
    const location = useLocation();
    const navigate = useNavigate();
    console.log('📄 INDEX: Router hooks initialized');
    const {
      t
    } = useTranslation('lore');
    console.log('📄 INDEX: Translation hook initialized');
    const {
      user
    } = useAuth();
    console.log('📄 INDEX: Auth hook initialized, user:', !!user);
    const {
      storiesShared,
      activeContributors,
      locationsCovered,
      isLoading,
      error
    } = useCommunityStats();
    console.log('📄 INDEX: Community stats initialized');
    const {
      showOnboarding,
      completeOnboarding,
      skipOnboarding
    } = useOnboarding();
    console.log('📄 INDEX: Onboarding hook initialized');
    console.log('📄 INDEX: All hooks initialized successfully, rendering JSX...');
    return <MainLayout>
      <div className="min-h-screen pb-24 md:pb-0">
        {/* Simplified Mobile Hero */}
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 pt-8 pb-6">
          <div className="text-center max-w-sm mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-4xl font-bold text-foreground mb-3"
            >
              LocaleLore
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-lg text-muted-foreground mb-6"
            >
              Discover local stories & legends
            </motion.p>
            
            {/* Mobile-First Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <HeroSearchBar className="w-full" />
            </motion.div>
          </div>
        </div>

        {/* Mobile-First Main Actions */}
        <div className="px-4 py-6">
          {/* Primary Actions - Stack on Mobile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 mb-8"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/explore')} 
              className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <Compass className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-lg font-semibold">{t('exploreStories', 'Explore Stories')}</div>
                  <div className="text-xs opacity-90">Discover local legends</div>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/map')} 
              className="w-full h-16 border-2 hover:bg-accent/50 touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-lg font-semibold">Explore Map</div>
                  <div className="text-xs text-muted-foreground">See nearby stories</div>
                </div>
              </div>
            </Button>
          </motion.div>

          {/* Quick Access Cards - 2x2 Grid on Mobile */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-3 mb-8"
          >
            <Card 
              className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group touch-manipulation"
              onClick={() => navigate('/explore')}
            >
              <div className="text-center">
                <Sparkles className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm mb-1">Daily Discovery</h3>
                <p className="text-xs text-muted-foreground">Personalized content</p>
              </div>
            </Card>
            
            <Card 
              className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group touch-manipulation"
              onClick={() => navigate('/search')}
            >
              <div className="text-center">
                <Search className="h-6 w-6 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm mb-1">Search</h3>
                <p className="text-xs text-muted-foreground">Find specific stories</p>
              </div>
            </Card>
            
            <Card 
              className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group touch-manipulation"
              onClick={() => navigate('/stories')}
            >
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm mb-1">Trending</h3>
                <p className="text-xs text-muted-foreground">Popular stories</p>
              </div>
            </Card>
            
            <Card 
              className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group touch-manipulation"
              onClick={() => navigate('/submit')}
            >
              <div className="text-center">
                <BookOpen className="h-6 w-6 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-sm mb-1">Share Story</h3>
                <p className="text-xs text-muted-foreground">Contribute content</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Mobile-Optimized Feature Section */}
        <div className="px-4 mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg font-semibold text-center mb-6"
          >
            Why LocaleLore?
          </motion.h2>
          
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Smart Discovery</h3>
                <p className="text-xs text-muted-foreground">AI-powered recommendations based on your location and interests</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Community Verified</h3>
                <p className="text-xs text-muted-foreground">All stories verified by local community members</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-4 p-4 bg-card rounded-lg border"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Growing Community</h3>
                <p className="text-xs text-muted-foreground">Join thousands sharing and discovering local stories</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile-First Auth CTA */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="px-4 mb-8"
          >
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 text-center border">
              <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign up to save stories, contribute content, and connect with locals
              </p>
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full touch-manipulation" 
                  onClick={() => navigate('/auth')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Get Started Free
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full touch-manipulation" 
                  onClick={() => navigate('/auth')}
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mobile-Compact Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="px-4"
        >
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Community Impact
              </h3>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading stats...</span>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">Stats unavailable</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl md:text-2xl font-bold text-primary mb-1">
                    {storiesShared?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Stories</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-secondary mb-1">
                    {activeContributors?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Contributors</div>
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-primary mb-1">
                    {locationsCovered?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">Locations</div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Onboarding Tour */}
      {showOnboarding && <OnboardingTour onComplete={completeOnboarding} onSkip={skipOnboarding} />}
    </MainLayout>;
  } catch (error) {
    console.error('📄 INDEX: Error during render:', error);
    return <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      color: 'white',
      fontSize: '20px',
      padding: '40px',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui'
    }}>
        <h1>🚨 INDEX PAGE ERROR</h1>
        <p>Error: {error instanceof Error ? error.message : String(error)}</p>
        <button onClick={() => window.location.reload()} style={{
        padding: '15px 30px',
        fontSize: '16px',
        background: 'white',
        color: '#ee5a24',
        border: 'none',
        borderRadius: '8px',
        marginTop: '20px',
        cursor: 'pointer'
      }}>
          Reload Page
        </button>
      </div>;
  }
};
export default Index;