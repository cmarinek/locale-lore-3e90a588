
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Flame, Gift, Users, Award, Crown } from 'lucide-react';
import { MainLayout } from '@/components/templates/MainLayout';
import { GamificationHeader } from '@/components/gamification/GamificationHeader';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { ChallengeCard } from '@/components/gamification/ChallengeCard';
import { LeaderboardCard } from '@/components/gamification/LeaderboardCard';
import { ContributionLevelSystem } from '@/components/gamification/ContributionLevelSystem';
import { SeasonalChallenges } from '@/components/gamification/SeasonalChallenges';
import { SocialSharing } from '@/components/gamification/SocialSharing';
import { VisualProgressIndicators } from '@/components/gamification/VisualProgressIndicators';
import { PointsAnimation, usePointsNotifications } from '@/components/gamification/PointsAnimation';
import { ReputationDisplay } from '@/components/verification/ReputationDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  category: string;
  earned_at?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_points: number;
  current_progress?: number;
  is_completed?: boolean;
  end_date?: string;
}

export default function Gamification() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalContributions: 0,
    level: 1
  });
  const [loading, setLoading] = useState(true);

  const { notifications, addNotification, removeNotification } = usePointsNotifications();

  // Mock progress steps for demonstration
  const progressSteps = [
    {
      id: '1',
      title: 'First Fact Submission',
      description: 'Submit your first fact to the platform',
      isCompleted: true,
      isCurrent: false,
      points: 50
    },
    {
      id: '2',
      title: 'Community Engagement',
      description: 'Vote on 10 facts and leave 5 comments',
      isCompleted: true,
      isCurrent: false,
      points: 100
    },
    {
      id: '3',
      title: 'Quality Contributor',
      description: 'Get 5 facts verified by the community',
      isCompleted: false,
      isCurrent: true,
      points: 200
    },
    {
      id: '4',
      title: 'Expert Explorer',
      description: 'Discover facts in 10 different locations',
      isCompleted: false,
      isCurrent: false,
      points: 300
    }
  ];

  const fetchGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .order('category', { ascending: true });

      // Fetch user's earned achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select(`
          earned_at,
          achievements (*)
        `)
        .eq('user_id', user.id);

      // Fetch active challenges with progress
      const { data: challengesData } = await supabase
        .from('challenges')
        .select(`
          *,
          user_challenge_progress (
            current_progress,
            is_completed
          )
        `)
        .eq('is_active', true)
        .order('challenge_type', { ascending: true });

      // Fetch user level and stats
      const { data: userLevel } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: userReputation } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (allAchievements) {
        setAchievements(allAchievements);
      }

      if (userAchievements) {
        const earned = userAchievements.map(ua => ({
          ...ua.achievements,
          earned_at: ua.earned_at
        }));
        setEarnedAchievements(earned);
      }

      if (challengesData) {
        const challengesWithProgress = challengesData.map(challenge => ({
          ...challenge,
          current_progress: challenge.user_challenge_progress?.[0]?.current_progress || 0,
          is_completed: challenge.user_challenge_progress?.[0]?.is_completed || false,
        }));
        setChallenges(challengesWithProgress);
      }

      // Update user stats
      if (userLevel || userReputation) {
        setUserStats({
          totalPoints: userLevel?.total_xp || 0,
          currentStreak: userReputation?.streak_days || 0,
          longestStreak: userReputation?.streak_days || 0, // Would need separate field
          totalContributions: (userReputation?.facts_verified || 0) + (userReputation?.votes_cast || 0),
          level: userLevel?.current_level || 1
        });
      }

    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, []);

  // Demo function to show points animation
  const handleDemoPointsAnimation = () => {
    addNotification(25, 'discovery');
    setTimeout(() => addNotification(50, 'verification'), 1000);
    setTimeout(() => addNotification(10, 'comment'), 2000);
  };

  const groupAchievementsByCategory = (achievements: Achievement[]) => {
    return achievements.reduce((groups, achievement) => {
      const category = achievement.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(achievement);
      return groups;
    }, {} as Record<string, Achievement[]>);
  };

  const earnedAchievementIds = earnedAchievements.map(a => a.id);
  const unlockedAchievements = achievements.filter(a => earnedAchievementIds.includes(a.id));
  const lockedAchievements = achievements.filter(a => !earnedAchievementIds.includes(a.id));

  const groupedEarned = groupAchievementsByCategory(unlockedAchievements);
  const groupedLocked = groupAchievementsByCategory(lockedAchievements);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discovery': return <Star className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'verification': return <Trophy className="h-4 w-4" />;
      case 'streak': return <Flame className="h-4 w-4" />;
      case 'level': return <Target className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const AchievementSection = ({ title, achievements, isEarned }: { 
    title: string; 
    achievements: Record<string, Achievement[]>; 
    isEarned: boolean;
  }) => (
    <div className="space-y-6">
      {Object.entries(achievements).map(([category, categoryAchievements]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg capitalize">
                {getCategoryIcon(category)}
                {category} Achievements
                <Badge variant="outline">
                  {categoryAchievements.length}
                </Badge>
              </div>
              {isEarned && categoryAchievements.length > 0 && (
                <SocialSharing achievement={categoryAchievements[0]} />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categoryAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={!isEarned ? 'opacity-50 grayscale' : ''}
                >
                  <AchievementBadge
                    achievement={achievement}
                    size="lg"
                    showTooltip={true}
                    isNew={isEarned && achievement.earned_at && 
                           new Date(achievement.earned_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)}
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        {/* Points Animation */}
        <PointsAnimation 
          notifications={notifications}
          onComplete={removeNotification}
        />

        {/* Header */}
        <GamificationHeader />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Levels
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leaderboards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              {/* Progress Indicators */}
              <VisualProgressIndicators
                steps={progressSteps}
                overallProgress={65}
                streak={{
                  current: userStats.currentStreak,
                  longest: userStats.longestStreak,
                  type: 'daily_discovery'
                }}
                level={{
                  current: userStats.level,
                  progress: 75,
                  nextLevelPoints: 250
                }}
              />

              {/* Reputation Display */}
              <ReputationDisplay 
                userId={user?.id}
                compact={false}
                showAchievements={true}
              />
            </motion.div>

            {/* Demo Button */}
            <Card>
              <CardContent className="p-4">
                <button
                  onClick={handleDemoPointsAnimation}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Demo Points Animation
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {Object.keys(groupedEarned).length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    Earned Achievements ({unlockedAchievements.length})
                  </h2>
                  <AchievementSection 
                    title="Earned" 
                    achievements={groupedEarned} 
                    isEarned={true} 
                  />
                </div>
              )}

              {Object.keys(groupedLocked).length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-muted-foreground mb-6 flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Locked Achievements ({lockedAchievements.length})
                  </h2>
                  <AchievementSection 
                    title="Locked" 
                    achievements={groupedLocked} 
                    isEarned={false} 
                  />
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Regular Challenges */}
              <div className="grid gap-4 md:grid-cols-2">
                {challenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ChallengeCard challenge={challenge} />
                  </motion.div>
                ))}
              </div>

              {/* Seasonal Challenges */}
              <SeasonalChallenges />
            </motion.div>
          </TabsContent>

          <TabsContent value="levels" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ContributionLevelSystem
                currentPoints={userStats.totalPoints}
                totalContributions={userStats.totalContributions}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <LeaderboardCard />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
