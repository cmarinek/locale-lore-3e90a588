
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Crown, Shield, Award, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface ContributionLevel {
  level: number;
  title: string;
  icon: any;
  color: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
}


interface ContributionLevelSystemProps {
  currentPoints: number;
  totalContributions: number;
  className?: string;
}

export const ContributionLevelSystem: React.FC<ContributionLevelSystemProps> = ({
  currentPoints,
  totalContributions,
  className
}) => {
  const CONTRIBUTION_LEVELS = useMemo<ContributionLevel[]>(() => [
    {
      level: 1,
      title: 'Explorer',
      icon: Star,
      color: '#64748B',
      minPoints: 0,
      maxPoints: 99,
      benefits: ['Submit facts', 'Vote on content', 'Basic profile']
    },
    {
      level: 2,
      title: 'Contributor',
      icon: Award,
      color: '#06B6D4',
      minPoints: 100,
      maxPoints: 499,
      benefits: ['Verified badge', 'Comment priority', 'Custom avatar']
    },
    {
      level: 3,
      title: 'Curator',
      icon: Shield,
      color: '#10B981',
      minPoints: 500,
      maxPoints: 999,
      benefits: ['Fact verification', 'Moderation tools', 'Profile themes']
    },
    {
      level: 4,
      title: 'Expert',
      icon: Zap,
      color: '#8B5CF6',
      minPoints: 1000,
      maxPoints: 4999,
      benefits: ['Advanced analytics', 'Priority support', 'Beta features']
    },
    {
      level: 5,
      title: 'Master',
      icon: Trophy,
      color: '#F59E0B',
      minPoints: 5000,
      maxPoints: 9999,
      benefits: ['Content spotlights', 'Special events', 'Mentorship program']
    },
    {
      level: 6,
      title: 'Legend',
      icon: Crown,
      color: '#EF4444',
      minPoints: 10000,
      maxPoints: Infinity,
      benefits: ['Hall of Fame', 'Platform governance', 'Exclusive perks']
    }
  ], []);

  const currentLevel = CONTRIBUTION_LEVELS.find(
    level => currentPoints >= level.minPoints && currentPoints <= level.maxPoints
  ) || CONTRIBUTION_LEVELS[0];

  const nextLevel = CONTRIBUTION_LEVELS.find(
    level => level.level === currentLevel.level + 1
  );

  const progressInLevel = nextLevel
    ? ((currentPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const CurrentIcon = currentLevel.icon;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Level Display */}
      <Card className="bg-gradient-to-br from-card via-card/90 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-3 rounded-full border-2"
              style={{ 
                borderColor: currentLevel.color,
                backgroundColor: `${currentLevel.color}20`
              }}
            >
              <CurrentIcon 
                className="w-6 h-6" 
                style={{ color: currentLevel.color }} 
              />
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {currentLevel.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                Level {currentLevel.level} • {currentPoints.toLocaleString()} points
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress to next level */}
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Progress to {nextLevel.title}
                </span>
                <span className="font-medium text-foreground">
                  {nextLevel.minPoints - currentPoints} points needed
                </span>
              </div>
              <Progress value={progressInLevel} className="h-3" />
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Level Benefits</h4>
            <div className="flex flex-wrap gap-2">
              {currentLevel.benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {totalContributions}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Contributions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {currentLevel.level}
              </div>
              <div className="text-xs text-muted-foreground">
                Current Level
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Levels Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Contribution Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CONTRIBUTION_LEVELS.map((level) => {
              const LevelIcon = level.icon;
              const isUnlocked = currentPoints >= level.minPoints;
              const isCurrent = level.level === currentLevel.level;

              return (
                <motion.div
                  key={level.level}
                  className={`
                    flex items-center gap-4 p-3 rounded-lg border transition-all
                    ${isCurrent 
                      ? 'bg-primary/10 border-primary/30' 
                      : isUnlocked 
                        ? 'bg-muted/30 border-border' 
                        : 'bg-muted/10 border-muted-foreground/20 opacity-60'
                    }
                  `}
                  whileHover={isUnlocked ? { scale: 1.02 } : {}}
                >
                  <div
                    className={`
                      p-2 rounded-full border-2 
                      ${isUnlocked ? '' : 'grayscale'}
                    `}
                    style={{
                      borderColor: isUnlocked ? level.color : '#64748B',
                      backgroundColor: isUnlocked ? `${level.color}20` : '#64748B20'
                    }}
                  >
                    <LevelIcon 
                      className="w-5 h-5" 
                      style={{ color: isUnlocked ? level.color : '#64748B' }} 
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {level.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Level {level.level}
                      </Badge>
                      {isCurrent && (
                        <Badge className="text-xs bg-primary/20 text-primary">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {level.maxPoints === Infinity 
                        ? `${level.minPoints.toLocaleString()}+ points`
                        : `${level.minPoints.toLocaleString()} - ${level.maxPoints.toLocaleString()} points`
                      }
                    </p>
                  </div>

                  {isUnlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      <Trophy className="w-5 h-5" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
