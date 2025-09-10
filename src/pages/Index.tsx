import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { WelcomeHero } from '@/components/organisms/WelcomeHero';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Compass, Search, BookOpen, Star, MapPin, TrendingUp, Users, Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
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
      <div className="min-h-screen">
        {/* Hero Section */}
        <WelcomeHero />
      
      {/* Main Actions */}
      <div className="container mx-auto px-4 py-12">
        <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="text-center mb-12">
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('subtitle', 'Discover fascinating local stories and legends from around the world')}
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <motion.div initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.3
              }}>
              <Button size="lg" onClick={() => navigate('/explore')} className="w-full h-24 bg-primary hover:bg-primary/90 text-primary-foreground">
                <div className="flex flex-col items-center gap-2">
                  <Compass className="w-8 h-8" />
                  <span className="text-lg font-semibold">{t('exploreStories', 'Explore Stories')}</span>
                </div>
              </Button>
            </motion.div>
            
            <motion.div initial={{
                opacity: 0,
                x: 20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: 0.4
              }}>
              <Button variant="outline" onClick={() => navigate('/map')} className="w-full h-24 border-2 hover:bg-accent/50">
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
          <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.5
            }}>
            <Card className="p-6 h-full">
              <Search className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
              <p className="text-muted-foreground mb-4">
                Find stories by location, category, or keywords with powerful filters.
              </p>
              <Button variant="outline" onClick={() => navigate('/search')} className="min-h-[44px]">
                Search Stories
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.6
            }}>
            <Card className="p-6 h-full">
              <BookOpen className="w-12 h-12 text-secondary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Share Your Story</h3>
              <p className="text-muted-foreground mb-4">
                Contribute your own local stories and legends to the community.
              </p>
              <Button variant="outline" onClick={() => navigate('/submit')} className="min-h-[44px]">
                Submit Story
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.7
            }}>
            <Card className="p-6 h-full">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Verified Content</h3>
              <p className="text-muted-foreground mb-4">
                All stories are community-verified for authenticity and accuracy.
              </p>
              <Button variant="outline" onClick={() => navigate('/profile')} className="min-h-[44px]">
                Learn More
              </Button>
            </Card>
          </motion.div>
        </div>

        {/* Join LocaleLore Section - Show for non-authenticated users */}
        {!user && <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.75
          }} className="text-center mb-12">
            <div className="bg-card rounded-2xl p-8 elevation-2 max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">Join LocaleLore Community</h3>
              <div className="space-y-3">
                <Button size="lg" className="w-full" onClick={() => navigate('/auth')}>
                  <Users className="mr-2 h-4 w-4" />
                  Sign Up Free
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/auth')}>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </div>
            </div>
          </motion.div>}

        {/* Stats Section */}
        <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.8
          }} className="text-center">
          <Card className="p-8 bg-primary/5">
            <h3 className="text-2xl font-semibold mb-6 flex items-center justify-center gap-2">
              <TrendingUp className="w-6 h-6 text-secondary" />
              Community Impact
            </h3>
            {isLoading ? <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading community stats...</span>
              </div> : error ? <div className="text-center py-8">
                <p className="text-muted-foreground">Unable to load community stats</p>
              </div> : <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {storiesShared?.toLocaleString() || '0'}
                  </div>
                  <div className="text-muted-foreground">Stories Shared</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {activeContributors?.toLocaleString() || '0'}
                  </div>
                  <div className="text-muted-foreground">Active Contributors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary mb-2">
                    {locationsCovered?.toLocaleString() || '0'}
                  </div>
                  <div className="text-muted-foreground">Locations Covered</div>
                </div>
              </div>}
          </Card>
        </motion.div>
      </div>
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