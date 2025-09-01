import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Flame, Gift, Users } from 'lucide-react';
import { MainLayout } from '@/components/templates/MainLayout';
import { GamificationHeader } from '@/components/gamification/GamificationHeader';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { ChallengeCard } from '@/components/gamification/ChallengeCard';
import { LeaderboardCard } from '@/components/gamification/LeaderboardCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

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

    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, []);

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
            <CardTitle className="flex items-center gap-2 text-lg capitalize">
              {getCategoryIcon(category)}
              {category} Achievements
              <Badge variant="outline">
                {categoryAchievements.length}
              </Badge>
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
        {/* Header */}
        <GamificationHeader />

        <Tabs defaultValue="achievements" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leaderboards
            </TabsTrigger>
          </TabsList>

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