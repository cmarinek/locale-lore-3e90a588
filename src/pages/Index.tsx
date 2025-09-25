import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { WelcomeHeroOptimized } from '@/components/organisms/WelcomeHeroOptimized';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Compass, Search, BookOpen, Star, MapPin, TrendingUp, Users, Shield, Loader2, Sparkles } from 'lucide-react';
// Removed heavy framer-motion for performance - using CSS animations instead
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
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

    // Define initialization steps
    const initSteps = [
      {
        name: 'Translation System',
        check: () => typeof t === 'function'
      },
      {
        name: 'Router Navigation',
        check: () => typeof navigate === 'function'
      },
      {
        name: 'Authentication Context',
        check: () => true // Auth context is always available
      }
    ];

    return (
      <MainLayout>
        <div className="min-h-screen">
          {/* Hero Section */}
          <ErrorBoundary fallback={
          <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">Loading welcome section...</p>
            </div>
          </div>
        }>
          <WelcomeHeroOptimized />
        </ErrorBoundary>
      
      {/* Main Actions */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in-fast">
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('subtitle', 'Discover fascinating local stories and legends from around the world')}
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 animate-hero-search">
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <div className="text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Discover Daily</h3>
                <p className="text-sm text-muted-foreground">Get personalized local stories</p>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Explore Map</h3>
                <p className="text-sm text-muted-foreground">See stories around you</p>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Trending Stories</h3>
                <p className="text-sm text-muted-foreground">Popular local legends</p>
              </div>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <div className="text-center">
                <Users className="h-8 w-8 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">Join Community</h3>
                <p className="text-sm text-muted-foreground">Connect and contribute</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="animate-feature-card">
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
          </div>

          <div className="animate-feature-card">
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
          </div>

          <div className="animate-feature-card">
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
          </div>
        </div>

        {/* Join LocaleLore Section - Show for non-authenticated users */}
        {!user && (
          <div className="text-center mb-12 animate-hero-trending">
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
          </div>
        )}

        {/* Stats Section */}
        <div className="text-center animate-hero-buttons">
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
        </div>
      </div>
    </div>

        {/* Welcome Onboarding */}
        {showOnboarding && (
          <ErrorBoundary>
            <WelcomeOnboarding onComplete={completeOnboarding} onSkip={skipOnboarding} />
          </ErrorBoundary>
        )}
      </MainLayout>
    );
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