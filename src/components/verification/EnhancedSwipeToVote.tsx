
import React, { useState, useRef } from 'react';
import { motion, PanInfo, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/ios-badge';
import { useAppStore } from '@/stores/appStore';
import { useAnimations } from '@/hooks/useAnimations';

interface EnhancedSwipeToVoteProps {
  factId: string;
  currentVote?: boolean | null;
  onVoteChange?: (vote: boolean | null) => void;
  disabled?: boolean;
  onVote?: (isUpvote: boolean) => Promise<void>;
}

export const EnhancedSwipeToVote: React.FC<EnhancedSwipeToVoteProps> = ({
  factId,
  currentVote,
  onVoteChange,
  disabled = false,
  onVote
}) => {
  const { triggerHapticFeedback } = useAppStore();
  const { shouldReduceMotion } = useAnimations();
  const [isVoting, setIsVoting] = useState(false);
  const [localVote, setLocalVote] = useState<boolean | null>(currentVote || null);
  
  const x = useMotionValue(0);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  // Transform values based on drag position
  const leftIndicatorOpacity = useTransform(x, [-150, -50], [1, 0]);
  const rightIndicatorOpacity = useTransform(x, [50, 150], [0, 1]);
  const cardRotation = useTransform(x, [-150, 0, 150], [-5, 0, 5]);
  const cardScale = useTransform(x, [-150, 0, 150], [1.05, 1, 1.05]);

  // Background gradient based on drag
  const backgroundGradient = useTransform(
    x,
    [-150, -50, 50, 150],
    [
      'linear-gradient(to right, rgba(239, 68, 68, 0.2), transparent)',
      'linear-gradient(to right, rgba(239, 68, 68, 0.1), transparent)',
      'linear-gradient(to left, rgba(34, 197, 94, 0.1), transparent)',
      'linear-gradient(to left, rgba(34, 197, 94, 0.2), transparent)'
    ]
  );

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = 100;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      const isUpvote = offset > 0;
      await processVote(isUpvote);
    } else {
      // Snap back to center
      controls.start({ x: 0 });
      x.set(0);
    }
  };

  const processVote = async (isUpvote: boolean) => {
    if (isVoting || disabled) return;

    setIsVoting(true);
    const wasCurrentVote = localVote === isUpvote;
    const newVote = wasCurrentVote ? null : isUpvote;
    
    // Optimistic update
    setLocalVote(newVote);
    onVoteChange?.(newVote);

    // Haptic feedback
    triggerHapticFeedback(newVote === null ? 'light' : 'medium');

    // Celebration animation for vote
    if (newVote !== null) {
      controls.start({
        scale: [1, 1.1, 1],
        rotateZ: [0, newVote ? 2 : -2, 0],
        transition: { duration: 0.4, ease: "easeOut" }
      });
    }

    try {
      if (onVote) {
        await onVote(isUpvote);
      }
      
      // Success animation
      controls.start({
        y: [0, -10, 0],
        transition: { duration: 0.3 }
      });

    } catch (error) {
      // Revert optimistic update
      setLocalVote(currentVote || null);
      onVoteChange?.(currentVote || null);
      
      // Error shake animation
      controls.start({
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
      
      triggerHapticFeedback('heavy');
    } finally {
      setIsVoting(false);
      x.set(0);
    }
  };

  if (shouldReduceMotion) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-8">
          <button
            onClick={() => processVote(false)}
            disabled={disabled || isVoting}
            className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-red-50 transition-colors"
          >
            <ThumbsDown className="w-8 h-8 text-red-500" />
            <span className="text-sm font-medium text-red-500">Dispute</span>
          </button>
          
          <div className="text-center">
            <div className="text-sm text-muted-foreground">
              {disabled ? 'Login to vote' : isVoting ? 'Processing...' : 'Tap to vote'}
            </div>
            {localVote !== null && (
              <Badge className={localVote ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}>
                {localVote ? 'Verified' : 'Disputed'}
              </Badge>
            )}
          </div>

          <button
            onClick={() => processVote(true)}
            disabled={disabled || isVoting}
            className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-green-50 transition-colors"
          >
            <ThumbsUp className="w-8 h-8 text-green-500" />
            <span className="text-sm font-medium text-green-500">Verify</span>
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <motion.div
          className="flex items-center gap-2 text-red-500"
          style={{ opacity: leftIndicatorOpacity }}
        >
          <XCircle className="w-8 h-8" />
          <span className="font-bold">Dispute</span>
        </motion.div>
        
        <motion.div
          className="flex items-center gap-2 text-green-500"
          style={{ opacity: rightIndicatorOpacity }}
        >
          <span className="font-bold">Verify</span>
          <CheckCircle className="w-8 h-8" />
        </motion.div>
      </div>

      {/* Main voting card */}
      <motion.div
        ref={cardRef}
        drag={!disabled && !isVoting ? "x" : false}
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ 
          x, 
          rotateZ: cardRotation,
          scale: cardScale,
          background: backgroundGradient
        }}
        whileDrag={{ 
          cursor: 'grabbing',
          zIndex: 10
        }}
        className="cursor-grab active:cursor-grabbing"
      >
        <Card className={`p-6 border-2 transition-all duration-300 ${
          localVote === true ? 'border-green-500/30 bg-green-500/5' : 
          localVote === false ? 'border-red-500/30 bg-red-500/5' : 
          'border-border'
        }`}>
          <div className="flex items-center justify-center space-x-8">
            {/* Dispute side */}
            <motion.div
              className={`flex flex-col items-center space-y-2 ${
                localVote === false ? 'text-red-500' : 'text-muted-foreground'
              }`}
              whileHover={{ scale: 1.05 }}
              animate={{ 
                scale: localVote === false ? 1.1 : 1
              }}
            >
              <ThumbsDown className="w-8 h-8" />
              <span className="text-sm font-medium">Dispute</span>
            </motion.div>

            {/* Center indicator */}
            <div className="flex flex-col items-center space-y-2">
              <motion.div
                className="w-12 h-1 bg-gradient-to-r from-red-500 via-muted to-green-500 rounded-full"
                animate={{ 
                  scaleX: isVoting ? 1.5 : 1,
                  opacity: isVoting ? 0.8 : 0.4
                }}
              />
              <p className="text-xs text-muted-foreground text-center">
                {disabled ? 'Login to vote' : 
                 isVoting ? 'Processing...' : 
                 'Swipe to vote'}
              </p>
              
              {localVote !== null && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge 
                    className={`${
                      localVote ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                    }`}
                  >
                    {localVote ? 'Verified' : 'Disputed'}
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* Verify side */}
            <motion.div
              className={`flex flex-col items-center space-y-2 ${
                localVote === true ? 'text-green-500' : 'text-muted-foreground'
              }`}
              whileHover={{ scale: 1.05 }}
              animate={{ 
                scale: localVote === true ? 1.1 : 1
              }}
            >
              <ThumbsUp className="w-8 h-8" />
              <span className="text-sm font-medium">Verify</span>
            </motion.div>
          </div>

          {/* Voting feedback */}
          {isVoting && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center mt-4 text-sm text-muted-foreground"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
              </motion.div>
              Recording your vote...
            </motion.div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
