
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Star, Trophy, Target, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  points: number;
}

interface StreakData {
  current: number;
  longest: number;
  type: string;
}

interface VisualProgressIndicatorsProps {
  steps?: ProgressStep[];
  overallProgress?: number;
  streak?: StreakData;
  level?: {
    current: number;
    progress: number;
    nextLevelPoints: number;
  };
  className?: string;
}

export const VisualProgressIndicators: React.FC<VisualProgressIndicatorsProps> = ({
  steps = [],
  overallProgress = 0,
  streak,
  level,
  className
}) => {
  const StepIndicator = ({ step, index }: { step: ProgressStep; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted/30"
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        {step.isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        ) : step.isCurrent ? (
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 0 0 rgba(59, 130, 246, 0.7)',
                '0 0 0 10px rgba(59, 130, 246, 0)',
                '0 0 0 0 rgba(59, 130, 246, 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
          >
            <Circle className="w-5 h-5 text-white fill-white" />
          </motion.div>
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
            <Circle className="w-5 h-5 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Connecting line */}
        {index < steps.length - 1 && (
          <div 
            className={`absolute top-8 left-1/2 w-0.5 h-8 -translate-x-1/2 ${
              step.isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'
            }`}
          />
        )}
      </motion.div>
      
      <div className="flex-1">
        <h4 className={`font-medium ${step.isCompleted ? 'text-foreground' : step.isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
          {step.title}
        </h4>
        <p className="text-sm text-muted-foreground">{step.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            {step.points} XP
          </Badge>
          {step.isCompleted && (
            <Badge className="text-xs bg-green-500/20 text-green-600">
              Completed
            </Badge>
          )}
          {step.isCurrent && (
            <Badge className="text-xs bg-primary/20 text-primary">
              In Progress
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );

  const CircularProgress = ({ value, size = 120, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted/30"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            className="text-primary"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            style={{ strokeDasharray }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{Math.round(value)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Progress */}
      {overallProgress > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
              <Badge variant="secondary">{Math.round(overallProgress)}% Complete</Badge>
            </div>
            <div className="flex items-center gap-6">
              <CircularProgress value={overallProgress} />
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{Math.round(overallProgress)}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level Progress */}
      {level && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Level {level.current}
              </h3>
              <Badge variant="outline">
                {level.nextLevelPoints} XP to next level
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level Progress</span>
                <span className="font-medium text-foreground">{Math.round(level.progress)}%</span>
              </div>
              <Progress value={level.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streak Indicator */}
      {streak && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    scale: streak.current > 0 ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: streak.current > 0 ? Infinity : 0,
                    repeatDelay: 1
                  }}
                  className={`text-3xl ${streak.current > 0 ? '' : 'grayscale opacity-50'}`}
                >
                  🔥
                </motion.div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {streak.current} Day Streak
                  </h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {streak.type.replace('_', ' ')} streak
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">{streak.current}</div>
                <div className="text-xs text-muted-foreground">
                  Best: {streak.longest}
                </div>
              </div>
            </div>
            
            {streak.current > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                className="mt-4 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Step-by-step Progress */}
      {steps.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Progress Steps</h3>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <StepIndicator key={step.id} step={step} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Celebration Effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 pointer-events-none z-50"
      >
        {/* Confetti or celebration particles would go here */}
      </motion.div>
    </div>
  );
};
