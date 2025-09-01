import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, Gift, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface ChallengeCardProps {
  challenge: Challenge;
  onAction?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onAction
}) => {
  const progress = challenge.current_progress || 0;
  const progressPercentage = (progress / challenge.target_value) * 100;
  const isCompleted = challenge.is_completed || progress >= challenge.target_value;

  const getTimeRemaining = () => {
    if (!challenge.end_date) return null;
    const now = new Date();
    const endDate = new Date(challenge.end_date);
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h left`;
    }
    return `${hours}h ${minutes}m left`;
  };

  const getChallengeTypeColor = () => {
    switch (challenge.challenge_type) {
      case 'daily': return 'bg-orange-500/20 text-orange-600 border-orange-500/30';
      case 'weekly': return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'monthly': return 'bg-purple-500/20 text-purple-600 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  return (
    <motion.div
      className={`
        relative p-4 rounded-xl border transition-all duration-200
        ${isCompleted 
          ? 'bg-green-500/10 border-green-500/30 shadow-green-500/20' 
          : 'bg-card border-border hover:shadow-md'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Completion overlay */}
      {isCompleted && (
        <motion.div
          className="absolute top-3 right-3"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">{challenge.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {challenge.description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progress: {progress}/{challenge.target_value}
            </span>
            <span className="font-medium text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5 }}
          >
            <Progress 
              value={progressPercentage} 
              className={`h-2 ${isCompleted ? 'bg-green-500/20' : 'bg-muted/30'}`}
            />
          </motion.div>
        </div>

        {/* Badges and info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getChallengeTypeColor()}>
              {challenge.challenge_type}
            </Badge>
            {challenge.end_date && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {getTimeRemaining()}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm font-medium text-primary">
              <Gift className="h-4 w-4" />
              {challenge.reward_points} XP
            </div>
          </div>
        </div>

        {/* Action button */}
        {!isCompleted && onAction && (
          <Button 
            onClick={onAction}
            size="sm"
            className="w-full"
            variant="outline"
          >
            Start Challenge
          </Button>
        )}
      </div>

      {/* Completion celebration effect */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-xl" />
        </motion.div>
      )}
    </motion.div>
  );
};