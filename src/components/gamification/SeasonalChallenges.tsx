
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Gift, 
  Star, 
  Trophy, 
  Snowflake, 
  Sun, 
  Leaf, 
  Flower2,
  Target,
  Users,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SeasonalChallenge {
  id: string;
  title: string;
  description: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  type: 'individual' | 'community' | 'location';
  startDate: Date;
  endDate: Date;
  targetValue: number;
  currentProgress: number;
  rewards: {
    points: number;
    badge?: string;
    title?: string;
  };
  participants: number;
  isActive: boolean;
  isCompleted: boolean;
}


// Mock data - in real app, fetch from API
const mockChallenges: SeasonalChallenge[] = [
  {
    id: '1',
    title: 'Spring Discovery Quest',
    description: 'Discover 25 new facts about nature and outdoor locations during spring season',
    season: 'spring',
    type: 'individual',
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-06-20'),
    targetValue: 25,
    currentProgress: 18,
    rewards: { points: 500, badge: '🌸', title: 'Spring Explorer' },
    participants: 1247,
    isActive: true,
    isCompleted: false
  },
  {
    id: '2',
    title: 'Community Summer Stories',
    description: 'Together, submit 1000 summer-themed facts and memories',
    season: 'summer',
    type: 'community',
    startDate: new Date('2024-06-21'),
    endDate: new Date('2024-09-22'),
    targetValue: 1000,
    currentProgress: 742,
    rewards: { points: 750, badge: '☀️', title: 'Summer Storyteller' },
    participants: 3891,
    isActive: true,
    isCompleted: false
  },
  {
    id: '3',
    title: 'Autumn Heritage Hunt',
    description: 'Explore and document historical locations with autumn significance',
    season: 'autumn',
    type: 'location',
    startDate: new Date('2024-09-23'),
    endDate: new Date('2024-12-21'),
    targetValue: 15,
    currentProgress: 8,
    rewards: { points: 600, badge: '🍂', title: 'Heritage Hunter' },
    participants: 892,
    isActive: true,
    isCompleted: false
  }
];

interface SeasonalChallengesProps {
  className?: string;
}

export const SeasonalChallenges: React.FC<SeasonalChallengesProps> = ({ className }) => {
  const [challenges, setChallenges] = useState<SeasonalChallenge[]>(mockChallenges);
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  const SEASONAL_THEMES = useMemo(() => ({
    spring: {
      icon: Flower2,
      color: '#10B981',
      gradient: 'from-green-400/20 to-emerald-500/20'
    },
    summer: {
      icon: Sun,
      color: '#F59E0B',
      gradient: 'from-yellow-400/20 to-orange-500/20'
    },
    autumn: {
      icon: Leaf,
      color: '#EF4444',
      gradient: 'from-orange-400/20 to-red-500/20'
    },
    winter: {
      icon: Snowflake,
      color: '#3B82F6',
      gradient: 'from-blue-400/20 to-cyan-500/20'
    }
  }), []);

  const CHALLENGE_TYPES = useMemo(() => ({
    individual: { icon: Target, label: 'Personal' },
    community: { icon: Users, label: 'Community' },
    location: { icon: MapPin, label: 'Location' }
  }), []);

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  const currentSeason = getCurrentSeason();
  const activeChallenges = challenges.filter(c => c.isActive);
  const completedChallenges = challenges.filter(c => c.isCompleted);

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    return `${hours} hours left`;
  };

  const ChallengeCard = ({ challenge }: { challenge: SeasonalChallenge }) => {
    const theme = SEASONAL_THEMES[challenge.season];
    const typeInfo = CHALLENGE_TYPES[challenge.type];
    const SeasonIcon = theme.icon;
    const TypeIcon = typeInfo.icon;
    const progressPercentage = (challenge.currentProgress / challenge.targetValue) * 100;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02 }}
        className="w-full"
      >
        <Card className={`bg-gradient-to-br ${theme.gradient} border-border/50`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-full border-2"
                  style={{ 
                    borderColor: theme.color,
                    backgroundColor: `${theme.color}20`
                  }}
                >
                  <SeasonIcon 
                    className="w-5 h-5" 
                    style={{ color: theme.color }} 
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs capitalize">
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {typeInfo.label}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {challenge.participants.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {challenge.rewards.badge && (
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="text-2xl"
                >
                  {challenge.rewards.badge}
                </motion.div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {challenge.description}
            </p>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress: {challenge.currentProgress}/{challenge.targetValue}
                </span>
                <span className="font-medium text-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Time and rewards */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {getTimeRemaining(challenge.endDate)}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                  <Gift className="w-4 h-4" />
                  {challenge.rewards.points} XP
                </div>
                {challenge.rewards.title && (
                  <Badge variant="outline" className="text-xs">
                    <Trophy className="w-3 h-3 mr-1" />
                    {challenge.rewards.title}
                  </Badge>
                )}
              </div>
            </div>

            {!challenge.isCompleted && (
              <Button className="w-full" variant="outline">
                Join Challenge
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Seasonal Challenges
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Join special seasonal events and earn exclusive rewards
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Challenges</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <motion.div
            className="grid gap-4 md:grid-cols-1 lg:grid-cols-2"
            layout
          >
            <AnimatePresence>
              {activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </AnimatePresence>
          </motion.div>
          
          {activeChallenges.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active challenges at the moment</p>
              <p className="text-sm">Check back soon for new seasonal events!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Exciting challenges coming soon!</p>
            <p className="text-sm">New seasonal events are being prepared</p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <motion.div
            className="grid gap-4 md:grid-cols-1 lg:grid-cols-2"
            layout
          >
            <AnimatePresence>
              {completedChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </AnimatePresence>
          </motion.div>
          
          {completedChallenges.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No completed challenges yet</p>
              <p className="text-sm">Complete your first challenge to see it here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
