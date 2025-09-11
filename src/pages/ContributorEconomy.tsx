
import React from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpertBadgeManager } from '@/components/contributor/ExpertBadgeManager';
import { PremiumContentManager } from '@/components/contributor/PremiumContentManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown,
  Heart,
  TrendingUp,
  DollarSign,
  Award,
  MapPin,
  BarChart3,
  Users,
  Star,
  Gift
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthProvider';

export const ContributorEconomy: React.FC = () => {
  const { user } = useAuth();

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                Contributor Economy
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Monetize your local expertise and build a sustainable income from your discoveries
              </p>
            </div>

            {/* Economy Overview */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Crown className="w-5 h-5" />
                    Expert Recognition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-700 mb-3">
                    Get verified as a local expert and unlock premium features
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Award className="w-3 h-3" />
                      <span>Verified badges</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>Location authority</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      <span>Priority visibility</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <DollarSign className="w-5 h-5" />
                    Monetization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-3">
                    Multiple revenue streams from your content and expertise
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Heart className="w-3 h-3" />
                      <span>Tips from followers</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Crown className="w-3 h-3" />
                      <span>Premium content sales</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Gift className="w-3 h-3" />
                      <span>Brand partnerships</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <BarChart3 className="w-5 h-5" />
                    Analytics & Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700 mb-3">
                    Track your performance and optimize your content strategy
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3" />
                      <span>Audience insights</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <TrendingUp className="w-3 h-3" />
                      <span>Revenue tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Star className="w-3 h-3" />
                      <span>Performance metrics</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <Tabs defaultValue="badges" className="space-y-6">
            <TabsList className="w-full overflow-x-auto">
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Expert Badges
              </TabsTrigger>
              <TabsTrigger value="premium" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Premium Content
              </TabsTrigger>
              <TabsTrigger value="partnerships" className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Partnerships
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Claims
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="badges" className="space-y-6">
              <ExpertBadgeManager />
            </TabsContent>

            <TabsContent value="premium" className="space-y-6">
              <PremiumContentManager />
            </TabsContent>

            <TabsContent value="partnerships" className="space-y-6">
              <SponsoredPartnerships />
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <LocationClaimsManager />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <CreatorAnalyticsDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

// Placeholder components for the remaining tabs
const SponsoredPartnerships: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Gift className="w-5 h-5" />
        Sponsored Partnerships
      </CardTitle>
      <CardDescription>
        Collaborate with brands and local businesses for sponsored content
      </CardDescription>
    </CardHeader>
    <CardContent className="py-8 text-center">
      <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Partnership Opportunities</h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        Connect with brands looking for authentic local voices. Earn money by featuring locations and experiences.
      </p>
      <Button>
        <Star className="w-4 h-4 mr-2" />
        Apply for Partnerships
      </Button>
    </CardContent>
  </Card>
);

const LocationClaimsManager: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Location Claims
      </CardTitle>
      <CardDescription>
        Claim ownership of locations and promote your business or expertise
      </CardDescription>
    </CardHeader>
    <CardContent className="py-8 text-center">
      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Claim Your Territory</h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        Become the verified expert for specific locations. Add business information, special offers, and exclusive content.
      </p>
      <Button>
        <MapPin className="w-4 h-4 mr-2" />
        Claim a Location
      </Button>
    </CardContent>
  </Card>
);

const CreatorAnalyticsDashboard: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Creator Analytics
      </CardTitle>
      <CardDescription>
        Track your performance and optimize your content strategy
      </CardDescription>
    </CardHeader>
    <CardContent className="py-8 text-center">
      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">Comprehensive Analytics</h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        Monitor your earnings, audience growth, and content performance with detailed insights and recommendations.
      </p>
      <Button>
        <TrendingUp className="w-4 h-4 mr-2" />
        View Full Analytics
      </Button>
    </CardContent>
  </Card>
);

export default ContributorEconomy;
