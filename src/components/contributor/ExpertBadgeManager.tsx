
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  MapPin, 
  Users, 
  Star, 
  CheckCircle, 
  Clock,
  Trophy,
  Shield,
  Crown,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { ExpertBadge } from '@/types/contributor';
import { toast } from '@/hooks/use-toast';

export const ExpertBadgeManager: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<ExpertBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchBadges(), fetchUserStats()]);
        setLoading(false);
      };

      loadData();
    } else {
      setBadges([]);
      setUserStats(null);
      setLoading(false);
    }
  }, [user]);

  const fetchBadges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expert_badges')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setBadges((data as ExpertBadge[]) ?? []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const [statsResult, profileResult, premiumContentResult] = await Promise.all([
        supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('profiles')
          .select('followers_count, reputation_score')
          .eq('id', user.id)
          .single(),
        supabase
          .from('premium_content')
          .select('id')
          .eq('creator_id', user.id),
      ]);

      if (statsResult.error) throw statsResult.error;
      if (profileResult.error) console.error('Error loading profile totals', profileResult.error);
      if (premiumContentResult.error) console.error('Error loading premium content count', premiumContentResult.error);

      const engagementRate = statsResult.data
        ? ((statsResult.data.comments_made || 0) + (statsResult.data.votes_cast || 0)) /
            Math.max(statsResult.data.facts_submitted || 1, 1)
        : 0;

      setUserStats({
        ...statsResult.data,
        followers_count: profileResult.data?.followers_count ?? 0,
        reputation_score: profileResult.data?.reputation_score ?? 0,
        premium_content_count: premiumContentResult.data?.length ?? 0,
        engagement_rate: Number(engagementRate.toFixed(2)),
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const applyForBadge = async (badgeType: string, locationArea: string, specialization: string) => {
    try {
      const { error } = await supabase.functions.invoke('apply-expert-badge', {
        body: {
          badge_type: badgeType,
          location_area: locationArea,
          specialization: specialization,
        }
      });

      if (error) throw error;

      toast({
        title: "Application submitted",
        description: "Your expert badge application has been submitted for review.",
      });

      setShowApplicationDialog(false);
      fetchBadges();
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'local_expert': return <MapPin className="w-5 h-5" />;
      case 'verified_contributor': return <CheckCircle className="w-5 h-5" />;
      case 'super_contributor': return <Star className="w-5 h-5" />;
      case 'content_creator': return <Trophy className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  const getBadgeColor = (badgeType: string, level: number) => {
    const colors = {
      local_expert: ['#64748B', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      verified_contributor: ['#6B7280', '#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444'],
      super_contributor: ['#6B7280', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      content_creator: ['#6B7280', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981'],
    };
    return colors[badgeType as keyof typeof colors]?.[level - 1] || '#6B7280';
  };

  const getRequirementsProgress = (badgeType: string) => {
    if (!userStats) return { progress: 0, requirements: [] };

    const requirements = {
      local_expert: [
        { name: 'Discoveries in area', current: userStats.facts_submitted || 0, target: 10 },
        { name: 'Local engagement', current: userStats.votes_cast || 0, target: 50 },
        { name: 'Follower count', current: userStats.followers_count || 0, target: 25 },
      ],
      verified_contributor: [
        { name: 'Total discoveries', current: userStats.facts_submitted || 0, target: 25 },
        { name: 'Verified facts', current: userStats.facts_verified || 0, target: 15 },
        { name: 'Community engagement', current: userStats.comments_made || 0, target: 100 },
      ],
      super_contributor: [
        { name: 'Total discoveries', current: userStats.facts_submitted || 0, target: 100 },
        { name: 'Reputation score', current: userStats.reputation_score || 0, target: 500 },
        { name: 'Active streak', current: userStats.current_streak || 0, target: 30 },
      ],
      content_creator: [
        { name: 'Premium content', current: userStats.premium_content_count || 0, target: 5 },
        { name: 'Followers', current: userStats.followers_count || 0, target: 100 },
        { name: 'Engagement rate', current: userStats.engagement_rate || 0, target: 5 },
      ],
    };

    const badgeRequirements = requirements[badgeType as keyof typeof requirements] || [];
    const completedRequirements = badgeRequirements.filter(req => req.current >= req.target).length;
    const progress = (completedRequirements / badgeRequirements.length) * 100;

    return { progress, requirements: badgeRequirements };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Badges */}
      {badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Your Expert Badges
            </CardTitle>
            <CardDescription>
              Recognition for your expertise and contributions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  <Card className="border-2" style={{ borderColor: getBadgeColor(badge.badge_type, badge.badge_level) }}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="p-2 rounded-full"
                          style={{ 
                            backgroundColor: `${getBadgeColor(badge.badge_type, badge.badge_level)}20`,
                            color: getBadgeColor(badge.badge_type, badge.badge_level)
                          }}
                        >
                          {getBadgeIcon(badge.badge_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">
                            {badge.badge_type.replace('_', ' ')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Level {badge.badge_level}
                          </p>
                        </div>
                      </div>

                      {badge.location_area && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          {badge.location_area}
                        </div>
                      )}

                      {badge.specialization && (
                        <Badge variant="secondary" className="text-xs">
                          {badge.specialization}
                        </Badge>
                      )}

                      <div className="mt-3 text-xs text-muted-foreground">
                        Verified {new Date(badge.verification_date).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Available Expert Badges</CardTitle>
          <CardDescription>
            Apply for recognition based on your contributions and expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Local Expert */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Local Expert</h3>
                  <p className="text-sm text-muted-foreground">
                    Recognized authority in a specific location or area
                  </p>
                </div>
              </div>

              {(() => {
                const { progress, requirements } = getRequirementsProgress('local_expert');
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Requirements Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="space-y-1">
                      {requirements.map((req, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className={req.current >= req.target ? 'text-green-600' : 'text-muted-foreground'}>
                            {req.name}
                          </span>
                          <span>
                            {req.current}/{req.target}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={badges.some(b => b.badge_type === 'local_expert')}
                    className="w-full"
                  >
                    {badges.some(b => b.badge_type === 'local_expert') ? 'Already Earned' : 'Apply Now'}
                  </Button>
                </DialogTrigger>
                <ExpertBadgeApplication onApply={applyForBadge} />
              </Dialog>
            </div>

            {/* Verified Contributor */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Verified Contributor</h3>
                  <p className="text-sm text-muted-foreground">
                    Trusted community member with quality contributions
                  </p>
                </div>
              </div>

              {(() => {
                const { progress, requirements } = getRequirementsProgress('verified_contributor');
                return (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Requirements Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                    <div className="space-y-1">
                      {requirements.map((req, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className={req.current >= req.target ? 'text-green-600' : 'text-muted-foreground'}>
                            {req.name}
                          </span>
                          <span>
                            {req.current}/{req.target}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <Button 
                variant="outline" 
                disabled={badges.some(b => b.badge_type === 'verified_contributor')}
                className="w-full"
              >
                {badges.some(b => b.badge_type === 'verified_contributor') ? 'Already Earned' : 'Apply Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Benefits</CardTitle>
          <CardDescription>
            Unlock exclusive features and opportunities with expert badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                Recognition
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verified badge on profile</li>
                <li>• Priority in search results</li>
                <li>• Featured in expert directory</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Platform Benefits
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Higher tip limits</li>
                <li>• Premium content creation</li>
                <li>• Advanced analytics access</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                Community
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Expert community access</li>
                <li>• Collaboration opportunities</li>
                <li>• Partnership invitations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ExpertBadgeApplication: React.FC<{ onApply: (badgeType: string, locationArea: string, specialization: string) => void }> = ({ onApply }) => {
  const [badgeType, setBadgeType] = useState('local_expert');
  const [locationArea, setLocationArea] = useState('');
  const [specialization, setSpecialization] = useState('');

  const handleSubmit = () => {
    if (!locationArea || !specialization) return;
    onApply(badgeType, locationArea, specialization);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Apply for Expert Badge</DialogTitle>
        <DialogDescription>
          Tell us about your expertise and the area you'd like to represent.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="badge-type">Badge Type</Label>
          <Select value={badgeType} onValueChange={setBadgeType}>
            <SelectTrigger>
              <SelectValue placeholder="Select badge type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local_expert">Local Expert</SelectItem>
              <SelectItem value="verified_contributor">Verified Contributor</SelectItem>
              <SelectItem value="super_contributor">Super Contributor</SelectItem>
              <SelectItem value="content_creator">Content Creator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location/Area</Label>
          <Input
            id="location"
            placeholder="e.g., Downtown San Francisco, Central Park NYC"
            value={locationArea}
            onChange={(e) => setLocationArea(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialization">Specialization</Label>
          <Textarea
            id="specialization"
            placeholder="Describe your expertise and why you should be recognized as an expert in this area..."
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={!locationArea || !specialization}
          className="w-full"
        >
          Submit Application
        </Button>
      </div>
    </DialogContent>
  );
};
