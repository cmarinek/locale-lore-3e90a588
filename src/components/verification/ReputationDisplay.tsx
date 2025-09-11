import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy, Star, Zap, Award, TrendingUp, Calendar, Target } from 'lucide-react';
import { Card } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/ios-badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';

interface UserReputation {
  total_score: number;
  votes_cast: number;
  votes_received: number;
  facts_verified: number;
  comments_made: number;
  streak_days: number;
}

interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  badge_color: string;
  earned_at?: string;
}

interface ReputationDisplayProps {
  userId?: string;
  compact?: boolean;
  showAchievements?: boolean;
}

export const ReputationDisplay: React.FC<ReputationDisplayProps> = ({
  userId,
  compact = false,
  showAchievements = true
}) => {
  const { user } = useAuth();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchUserData();
    }
  }, [targetUserId]);

  const fetchUserData = async () => {
    if (!targetUserId) return;

    try {
      // Fetch reputation
      const { data: repData } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (repData) {
        setReputation(repData);
      }

      // Fetch achievements if showing them
      if (showAchievements) {
        const { data: achievementsData } = await supabase
          .from('user_achievements')
          .select(`
            earned_at,
            achievements (
              id,
              slug,
              name,
              description,
              icon,
              category,
              badge_color
            )
          `)
          .eq('user_id', targetUserId)
          .order('earned_at', { ascending: false });

        if (achievementsData) {
          const formattedAchievements = achievementsData.map(ua => ({
            ...ua.achievements,
            earned_at: ua.earned_at
          })) as Achievement[];
          setAchievements(formattedAchievements);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReputationLevel = (score: number) => {
    if (score >= 10000) return { level: 'Legend', color: '#F59E0B', icon: Crown };
    if (score >= 5000) return { level: 'Master', color: '#8B5CF6', icon: Trophy };
    if (score >= 1000) return { level: 'Expert', color: '#10B981', icon: Star };
    if (score >= 500) return { level: 'Advanced', color: '#3B82F6', icon: Zap };
    if (score >= 100) return { level: 'Contributor', color: '#06B6D4', icon: Award };
    return { level: 'Newcomer', color: '#6B7280', icon: TrendingUp };
  };

  const getProgressToNextLevel = (score: number) => {
    const thresholds = [100, 500, 1000, 5000, 10000];
    const nextThreshold = thresholds.find(t => t > score);
    
    if (!nextThreshold) return { progress: 100, next: null };
    
    const prevThreshold = thresholds[thresholds.indexOf(nextThreshold) - 1] || 0;
    const progress = ((score - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
    
    return { progress, next: nextThreshold };
  };

  if (loading) {
    return (
      <Card className={`p-4 ${compact ? 'bg-muted/20' : 'bg-card/50 backdrop-blur'}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-8 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (!reputation) {
    return (
      <Card className={`p-4 ${compact ? 'bg-muted/20' : 'bg-card/50 backdrop-blur'}`}>
        <div className="text-center text-muted-foreground">
          <Target className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No reputation data yet</p>
        </div>
      </Card>
    );
  }

  const level = getReputationLevel(reputation.total_score);
  const progress = getProgressToNextLevel(reputation.total_score);
  const LevelIcon = level.icon;

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-3 bg-card/30 rounded-lg border border-border/50">
        <div className="flex items-center space-x-2">
          <LevelIcon className="w-5 h-5" style={{ color: level.color }} />
          <Badge 
            variant="default" 
            className="text-xs"
            style={{ backgroundColor: `${level.color}20`, color: level.color }}
          >
            {level.level}
          </Badge>
        </div>
        <div className="text-sm">
          <span className="font-medium text-foreground">{reputation.total_score}</span>
          <span className="text-muted-foreground"> rep</span>
        </div>
        {achievements.length > 0 && (
          <div className="flex -space-x-1">
            {achievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs"
                style={{ backgroundColor: achievement.badge_color }}
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
            {achievements.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                +{achievements.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main reputation card */}
      <Card className="p-6 bg-gradient-to-br from-card via-card/90 to-primary/5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-3 rounded-full border-2"
                style={{ borderColor: level.color, backgroundColor: `${level.color}20` }}
              >
                <LevelIcon className="w-6 h-6" style={{ color: level.color }} />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{level.level}</h3>
                <p className="text-sm text-muted-foreground">Reputation Level</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{reputation.total_score}</div>
              <div className="text-xs text-muted-foreground">Total Score</div>
            </div>
          </div>

          {/* Progress to next level */}
          {progress.next && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to next level</span>
                <span className="text-foreground font-medium">
                  {progress.next - reputation.total_score} points needed
                </span>
              </div>
              <Progress value={progress.progress} className="h-2" />
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xl font-bold text-foreground">{reputation.votes_cast}</div>
              <div className="text-xs text-muted-foreground">Votes Cast</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xl font-bold text-foreground">{reputation.facts_verified}</div>
              <div className="text-xs text-muted-foreground">Facts Verified</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xl font-bold text-foreground">{reputation.comments_made}</div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </motion.div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
                {reputation.streak_days}
                {reputation.streak_days > 0 && <span className="text-orange-500">🔥</span>}
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </motion.div>
          </div>
        </div>
      </Card>

      {/* Achievements */}
      {showAchievements && achievements.length > 0 && (
        <Card className="p-6 bg-card/50 backdrop-blur">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Achievements ({achievements.length})
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg border border-border bg-background/50"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${achievement.badge_color}30` }}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-foreground truncate">
                        {achievement.name}
                      </h5>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {achievement.description}
                      </p>
                      {achievement.earned_at && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};