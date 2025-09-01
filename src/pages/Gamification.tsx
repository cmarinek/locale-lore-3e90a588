
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/templates/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Users, 
  Calendar,
  Flame,
  Crown,
  Medal,
  Zap,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LeaderboardCard } from '@/components/gamification/LeaderboardCard';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { ChallengeCard } from '@/components/gamification/ChallengeCard';
import { PointsAnimation } from '@/components/gamification/PointsAnimation';
import { GamificationHeader } from '@/components/gamification/GamificationHeader';
import { ContributionLevelSystem } from '@/components/gamification/ContributionLevelSystem';
import { SeasonalChallenges } from '@/components/gamification/SeasonalChallenges';
import { SocialSharing } from '@/components/gamification/SocialSharing';
import { VisualProgressIndicators } from '@/components/gamification/VisualProgressIndicators';

interface UserLevel {
  current_level: number;
  current_xp: number;
  total_xp: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_color: string;
  icon: string;
  category: string;
  earned_at?: string;
  progress?: number;
  target?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_progress: number;
  reward_points: number;
  end_date: string;
  challenge_type: string;
}

interface UserStats {
  reputation_score: number;
  facts_submitted: number;
  votes_cast: number;
  comments_made: number;
  current_streak: number;
  total_points: number;
}

export const Gamification: React.FC = () => {
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user level
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      if (levelData) {
        setUserLevel(levelData);
      }

      // Fetch user statistics
      const { data: statsData } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      if (statsData) {
        setUserStats({
          reputation_score: statsData.reputation_score || 0,
          facts_submitted: statsData.facts_submitted || 0,
          votes_cast: statsData.votes_cast || 0,
          comments_made: statsData.comments_made || 0,
          current_streak: statsData.current_streak || 0,
          total_points: statsData.total_points || 0
        });
      }

      // Fetch all achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('category');
      
      if (achievementsData) {
        setAchievements(achievementsData);
      }

      // Fetch earned achievements
      const { data: earnedData } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (*)
        `)
        .eq('user_id', user!.id);
      
      if (earnedData) {
        setEarnedAchievements(earnedData.map(ua => ({
          ...ua.achievements,
          earned_at: ua.earned_at
        })));
      }

      // Fetch active challenges
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString());
      
      if (challengesData) {
        setChallenges(challengesData.map(challenge => ({
          ...challenge,
          current_progress: Math.floor(Math.random() * challenge.target_value) // Mock progress
        })));
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevelProgress = () => {
    if (!userLevel) return 0;
    const currentLevelXP = userLevel.current_xp;
    const nextLevelXP = userLevel.current_level * 1000; // Example: 1000 XP per level
    return (currentLevelXP / nextLevelXP) * 100;
  };

  const triggerPointsAnimation = (points: number) => {
    setPointsEarned(points);
    setShowPointsAnimation(true);
    setTimeout(() => setShowPointsAnimation(false), 3000);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your achievements...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <AnimatePresence>
            {showPointsAnimation && (
              <PointsAnimation points={pointsEarned} />
            )}
          </AnimatePresence>

          <GamificationHeader
            userStats={userStats}
            userLevel={userLevel}
            onPointsEarned={triggerPointsAnimation}
          />

          <div className="mt-8">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="progression" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progression
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Reputation Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">
                        {userStats?.reputation_score || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Current Streak
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {userStats?.current_streak || 0} days
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        Total Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {userStats?.total_points || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Medal className="w-4 h-4 text-purple-500" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {earnedAchievements.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {earnedAchievements.slice(0, 5).map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <AchievementBadge 
                            achievement={achievement}
                            size="sm"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{achievement.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {achievement.earned_at && formatDistanceToNow(new Date(achievement.earned_at), { addSuffix: true })}
                            </p>
                          </div>
                          <SocialSharing achievement={achievement} />
                        </div>
                      ))}
                      {earnedAchievements.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No achievements yet. Start exploring to earn your first badge!
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Active Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {challenges.slice(0, 3).map((challenge) => (
                        <ChallengeCard
                          key={challenge.id}
                          challenge={challenge}
                          compact
                        />
                      ))}
                      {challenges.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No active challenges. Check back soon for new challenges!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <VisualProgressIndicators 
                  userStats={userStats}
                  userLevel={userLevel}
                />
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Achievement Gallery</h2>
                  <Badge variant="outline">
                    {earnedAchievements.length} of {achievements.length} earned
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {achievements.map((achievement) => {
                    const isEarned = earnedAchievements.some(ea => ea.id === achievement.id);
                    const earnedData = earnedAchievements.find(ea => ea.id === achievement.id);
                    
                    return (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <AchievementBadge
                          achievement={isEarned ? earnedData : achievement}
                          locked={!isEarned}
                          showProgress
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Active Challenges</h2>
                  <Badge variant="outline">
                    {challenges.length} active
                  </Badge>
                </div>

                <SeasonalChallenges />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {challenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="leaderboard" className="space-y-6">
                <LeaderboardCard />
              </TabsContent>

              <TabsContent value="progression" className="space-y-6">
                <ContributionLevelSystem 
                  userLevel={userLevel}
                  userStats={userStats}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
