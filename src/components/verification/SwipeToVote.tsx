import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/ios-card';
import { Badge } from '@/components/ui/ios-badge';

interface SwipeVoteProps {
  factId: string;
  currentVote?: boolean | null;
  onVoteChange?: (vote: boolean | null) => void;
  disabled?: boolean;
}

export const SwipeToVote: React.FC<SwipeVoteProps> = ({
  factId,
  currentVote,
  onVoteChange,
  disabled = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [localVote, setLocalVote] = useState<boolean | null>(currentVote || null);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const controls = useAnimation();
  const constraintsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalVote(currentVote || null);
  }, [currentVote]);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = 100;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      const isUpvote = offset > 0;
      await processVote(isUpvote);
    } else {
      // Snap back to center
      controls.start({ x: 0, rotate: 0 });
      setDragDirection(null);
    }
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    setDragDirection(offset > 20 ? 'right' : offset < -20 ? 'left' : null);
  };

  const processVote = async (isUpvote: boolean) => {
    if (!user || isVoting || disabled) return;

    setIsVoting(true);
    const wasCurrentVote = localVote === isUpvote;
    const newVote = wasCurrentVote ? null : isUpvote;
    
    // Optimistic update
    setLocalVote(newVote);
    onVoteChange?.(newVote);

    // Animate based on vote
    if (newVote === true) {
      controls.start({ 
        x: 200, 
        rotate: 15, 
        scale: 1.1,
        transition: { type: "spring", stiffness: 300 }
      });
    } else if (newVote === false) {
      controls.start({ 
        x: -200, 
        rotate: -15, 
        scale: 1.1,
        transition: { type: "spring", stiffness: 300 }
      });
    } else {
      controls.start({ 
        x: 0, 
        rotate: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 400 }
      });
    }

    try {
      const { data, error } = await supabase.functions.invoke('process-vote', {
        body: { factId, isUpvote }
      });

      if (error) throw error;

      toast({
        title: "Vote Recorded",
        description: data.message,
      });

      // Animate back to center after success
      setTimeout(() => {
        controls.start({ 
          x: 0, 
          rotate: 0, 
          scale: 1,
          transition: { type: "spring", stiffness: 400 }
        });
        setDragDirection(null);
      }, 1000);

    } catch (error: any) {
      console.error('Vote error:', error);
      
      // Revert optimistic update
      setLocalVote(currentVote || null);
      onVoteChange?.(currentVote || null);
      
      controls.start({ x: 0, rotate: 0, scale: 1 });
      setDragDirection(null);

      toast({
        title: "Vote Failed",
        description: error.message || "Failed to record vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getCardBackground = () => {
    if (dragDirection === 'right') return 'bg-gradient-to-r from-green-500/20 to-background';
    if (dragDirection === 'left') return 'bg-gradient-to-l from-red-500/20 to-background';
    if (localVote === true) return 'bg-gradient-to-r from-green-500/10 to-background';
    if (localVote === false) return 'bg-gradient-to-l from-red-500/10 to-background';
    return 'bg-card';
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <motion.div
          className="flex items-center gap-2 text-red-500"
          animate={{ 
            opacity: dragDirection === 'left' ? 1 : 0,
            scale: dragDirection === 'left' ? 1 : 0.8
          }}
        >
          <XCircle className="w-8 h-8" />
          <span className="font-bold">Dispute</span>
        </motion.div>
        
        <motion.div
          className="flex items-center gap-2 text-green-500"
          animate={{ 
            opacity: dragDirection === 'right' ? 1 : 0,
            scale: dragDirection === 'right' ? 1 : 0.8
          }}
        >
          <span className="font-bold">Verify</span>
          <CheckCircle className="w-8 h-8" />
        </motion.div>
      </div>

      {/* Main voting card */}
      <motion.div
        ref={constraintsRef}
        className="relative"
      >
        <motion.div
          drag={!disabled && !isVoting ? "x" : false}
          dragConstraints={constraintsRef}
          dragElastic={0.3}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          whileDrag={{ 
            scale: 1.05,
            zIndex: 10,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
          }}
          className={`cursor-grab active:cursor-grabbing ${disabled ? 'cursor-not-allowed' : ''}`}
        >
          <Card className={`p-6 ${getCardBackground()} transition-all duration-300 border-2 ${
            localVote === true ? 'border-green-500/30' : 
            localVote === false ? 'border-red-500/30' : 
            'border-border'
          }`}>
            <div className="flex items-center justify-center space-x-8">
              {/* Dispute side */}
              <motion.div
                className={`flex flex-col items-center space-y-2 ${
                  localVote === false ? 'text-red-500' : 'text-muted-foreground'
                }`}
                animate={{ 
                  scale: localVote === false ? 1.1 : dragDirection === 'left' ? 1.2 : 1
                }}
              >
                <ThumbsDown className="w-8 h-8" />
                <span className="text-sm font-medium">Dispute</span>
              </motion.div>

              {/* Center swipe indicator */}
              <div className="flex flex-col items-center space-y-2">
                <motion.div
                  className="w-12 h-1 bg-gradient-to-r from-red-500 via-muted to-green-500 rounded-full"
                  animate={{ 
                    scaleX: dragDirection ? 1.5 : 1,
                    opacity: dragDirection ? 0.8 : 0.4
                  }}
                />
                <motion.p 
                  className="text-xs text-muted-foreground text-center"
                  animate={{ 
                    opacity: isVoting ? 0.5 : 1 
                  }}
                >
                  {disabled ? 'Login to vote' : 
                   isVoting ? 'Processing...' : 
                   'Swipe to vote'}
                </motion.p>
                
                {localVote !== null && (
                  <Badge 
                    variant="default" 
                    className={`${
                      localVote ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                    }`}
                  >
                    {localVote ? 'Verified' : 'Disputed'}
                  </Badge>
                )}
              </div>

              {/* Verify side */}
              <motion.div
                className={`flex flex-col items-center space-y-2 ${
                  localVote === true ? 'text-green-500' : 'text-muted-foreground'
                }`}
                animate={{ 
                  scale: localVote === true ? 1.1 : dragDirection === 'right' ? 1.2 : 1
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
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Recording your vote...
              </motion.div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};