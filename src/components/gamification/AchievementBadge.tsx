import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  category: string;
  earned_at?: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  isNew?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  size = 'md',
  showTooltip = true,
  isNew = false
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl'
  };

  const BadgeComponent = (
    <motion.div
      className={`
        ${sizeClasses[size]} 
        rounded-full border-2 border-border
        flex items-center justify-center
        relative overflow-hidden
        cursor-pointer
        transition-all duration-200
      `}
      style={{ 
        backgroundColor: achievement.badge_color,
        boxShadow: `0 0 20px ${achievement.badge_color}40`
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: `0 0 30px ${achievement.badge_color}60`
      }}
      whileTap={{ scale: 0.95 }}
      initial={isNew ? { scale: 0, rotate: -180 } : { scale: 1 }}
      animate={isNew ? { scale: 1, rotate: 0 } : { scale: 1 }}
      transition={isNew ? { 
        type: "spring", 
        stiffness: 400, 
        damping: 15,
        delay: 0.2
      } : {}}
    >
      <span className="text-white filter drop-shadow-md">
        {achievement.icon}
      </span>
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      />

      {/* New badge indicator */}
      {isNew && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        />
      )}
    </motion.div>
  );

  if (!showTooltip) {
    return BadgeComponent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {BadgeComponent}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-center">
            <div className="font-semibold text-foreground">{achievement.name}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {achievement.description}
            </div>
            {achievement.earned_at && (
              <div className="text-xs text-muted-foreground mt-2">
                Earned {new Date(achievement.earned_at).toLocaleDateString()}
              </div>
            )}
            <Badge variant="outline" className="mt-2 text-xs">
              {achievement.category}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};