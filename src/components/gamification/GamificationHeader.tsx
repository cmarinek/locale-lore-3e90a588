import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Trophy, Target, Flame, Crown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserLevel {
  current_level: number;
  current_xp: number;
  total_xp: number;
}

interface UserStreak {
  current_streak: number;
  streak_type: string;
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
}

export const GamificationHeader: React.FC = () => {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [userStreak, setUserStreak] = useState<UserStreak | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number>(1);
  const { toast } = useToast();

  const getXPForLevel = (level: number) => {
    return (level * 100) + ((level - 1) * 50);
  };

  const getProgressPercentage = () => {
    if (!userLevel) return 0;
    const currentLevelXP = getXPForLevel(userLevel.current_level);
    const nextLevelXP = getXPForLevel(userLevel.current_level + 1);
    const progressInLevel = userLevel.current_xp;
    return (progressInLevel / (nextLevelXP - currentLevelXP)) * 100;
  };

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user level
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (levelData && userLevel && levelData.current_level > userLevel.current_level) {
        setPreviousLevel(userLevel.current_level);
        setShowLevelUp(true);
        toast({
          title: "🎉 Level Up!",
          description: `You've reached level ${levelData.current_level}!`,
        });
      }
      
      setUserLevel(levelData);

      // Fetch daily streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', 'daily_discovery')
        .single();
      
      setUserStreak(streakData);

      // Fetch today's challenge
      const today = new Date().toISOString().split('T')[0];
      const { data: challengeData } = await supabase
        .from('challenges')
        .select(`
          *,
          user_challenge_progress (
            current_progress,
            is_completed
          )
        `)
        .eq('challenge_type', 'daily')
        .eq('is_active', true)
        .gte('end_date', today)
        .single();

      if (challengeData) {
        setDailyChallenge({
          ...challengeData,
          current_progress: challengeData.user_challenge_progress?.[0]?.current_progress || 0,
          is_completed: challengeData.user_challenge_progress?.[0]?.is_completed || false,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Crown className="h-6 w-6 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  Level {userLevel?.current_level || 1}
                </span>
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  {userLevel?.total_xp || 0} XP
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {userLevel ? getXPForLevel(userLevel.current_level + 1) - userLevel.current_xp : 100} XP to next level
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          {/* Streak */}
          {userStreak && userStreak.current_streak > 0 && (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Flame className="h-5 w-5 text-orange-500" />
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">
                  {userStreak.current_streak}
                </div>
                <div className="text-xs text-muted-foreground">day streak</div>
              </div>
            </motion.div>
          )}

          {/* Today's Challenge */}
          {dailyChallenge && !dailyChallenge.is_completed && (
            <motion.div 
              className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg border border-accent/20"
              whileHover={{ scale: 1.02 }}
            >
              <Target className="h-4 w-4 text-accent" />
              <div>
                <div className="text-sm font-medium">{dailyChallenge.title}</div>
                <div className="text-xs text-muted-foreground">
                  {dailyChallenge.current_progress}/{dailyChallenge.target_value}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress to Level {(userLevel?.current_level || 1) + 1}</span>
          <span className="text-primary font-medium">{Math.round(getProgressPercentage())}%</span>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5 }}
        >
          <Progress 
            value={getProgressPercentage()} 
            className="h-3 bg-muted/30"
          />
        </motion.div>
      </div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLevelUp(false)}
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="bg-gradient-to-br from-primary to-secondary p-8 rounded-2xl text-center text-white shadow-2xl"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Crown className="h-16 w-16 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Level Up!</h2>
              <p className="text-xl opacity-90">
                Congratulations! You've reached Level {userLevel?.current_level || 1}
              </p>
              <motion.div
                className="mt-4 text-sm opacity-75"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Tap anywhere to continue
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};