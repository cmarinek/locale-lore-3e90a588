import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { WelcomeHeroOptimized } from '@/components/organisms/WelcomeHeroOptimized';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Compass, Search, BookOpen, Star, MapPin, TrendingUp, Users, Shield, Loader2, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunityStats } from '@/hooks/useCommunityStats';
import { WelcomeOnboarding } from '@/components/onboarding/WelcomeOnboarding';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/contexts/AuthProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const Index: React.FC = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('lore');
  const { user } = useAuth();
  const { storiesShared, activeContributors, locationsCovered, isLoading: statsLoading, error: statsError } = useCommunityStats();
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  // Memoized quick actions to prevent re-renders
  const quickActions = React.useMemo(() => [
    {
      title: t?.('discover_daily') || 'Discover Daily',
      icon: Star,
      description: t?.('discover_daily_desc') || 'Find fascinating local stories',
      action: () => navigate('/explore'),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: t?.('explore_map') || 'Explore Map',
      icon: MapPin,
      description: t?.('explore_map_desc') || 'Navigate stories by location',
      action: () => navigate('/map'),
      gradient: 'from-blue-500 to-teal-500'
    },
    {
      title: t?.('trending_stories') || 'Trending Stories',
      icon: TrendingUp,
      description: t?.('trending_stories_desc') || 'See what\'s popular right now',
      action: () => navigate('/explore?filter=trending'),
      gradient: 'from-orange-500 to-red-500'
    },
    {
      title: t?.('join_community') || 'Join Community',
      icon: Users,
      description: t?.('join_community_desc') || 'Connect with local storytellers',
      action: () => navigate('/social'),
      gradient: 'from-green-500 to-emerald-500'
    }
  ], [t, navigate]);

  const featureCards = React.useMemo(() => [
    {
      title: t?.('advanced_search') || 'Advanced Search',
      description: t?.('advanced_search_desc') || 'Find stories by multiple criteria',
      icon: Search,
      action: () => navigate('/search')
    },
    {
      title: t?.('share_your_story') || 'Share Your Story',
      description: t?.('share_your_story_desc') || 'Tell the world about your place',
      icon: BookOpen,
      action: () => navigate('/submit')
    },
    {
      title: t?.('verified_content') || 'Verified Content',
      description: t?.('verified_content_desc') || 'Trust in authentic local knowledge',
      icon: Shield,
      action: () => navigate('/explore?filter=verified')
    }
  ], [t, navigate]);

  return (
    <ErrorBoundary>
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
                {quickActions.map((action, index) => (
                  <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={action.action}>
                    <div className="text-center">
                      <action.icon className="h-8 w-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {featureCards.map((feature, index) => (
                <div key={index} className="animate-feature-card">
                  <Card className="p-6 h-full">
                    <feature.icon className="w-12 h-12 text-secondary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <Button variant="outline" onClick={feature.action} className="min-h-[44px]">
                      {feature.title}
                    </Button>
                  </Card>
                </div>
              ))}
            </div>

            {/* User Authentication Section */}
            {!user && (
              <div className="text-center py-12 border-t border-border/40">
                <h2 className="text-2xl font-bold mb-4">{t('join_localelore', 'Join LocaleLore')}</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  {t('join_description', 'Create an account to share your own stories and connect with the community')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => navigate('/auth')} size="lg" className="min-h-[44px]">
                    {t('sign_up', 'Sign Up')}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/auth')} size="lg" className="min-h-[44px]">
                    {t('sign_in', 'Sign In')}
                  </Button>
                </div>
              </div>
            )}

            {/* Community Stats */}
            <div className="grid grid-cols-3 gap-6 py-12 border-t border-border/40">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {statsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  ) : statsError ? (
                    '---'
                  ) : (
                    storiesShared?.toLocaleString() || '1,000+'
                  )}
                </div>
                <p className="text-muted-foreground">{t('stories_shared', 'Stories Shared')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">
                  {statsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  ) : statsError ? (
                    '---'
                  ) : (
                    activeContributors?.toLocaleString() || '500+'
                  )}
                </div>
                <p className="text-muted-foreground">{t('active_contributors', 'Active Contributors')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {statsLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  ) : statsError ? (
                    '---'
                  ) : (
                    locationsCovered?.toLocaleString() || '100+'
                  )}
                </div>
                <p className="text-muted-foreground">{t('locations_covered', 'Locations Covered')}</p>
              </div>
            </div>
          </div>

          {/* Welcome Onboarding */}
          {showOnboarding && (
            <ErrorBoundary>
              <WelcomeOnboarding onComplete={completeOnboarding} onSkip={skipOnboarding} />
            </ErrorBoundary>
          )}
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
});

export default Index;