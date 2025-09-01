import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { Badge } from '@/components/ui/badge';

interface LiveVoteCounterProps {
  factId: string;
  initialUpVotes: number;
  initialDownVotes: number;
  userVote?: boolean | null;
  compact?: boolean;
}

export const LiveVoteCounter: React.FC<LiveVoteCounterProps> = ({
  factId,
  initialUpVotes,
  initialDownVotes,
  userVote,
  compact = false
}) => {
  const { factVotes } = useRealtimeStore();
  const [previousVotes, setPreviousVotes] = useState({ up: initialUpVotes, down: initialDownVotes });
  
  const currentVotes = factVotes.get(factId) || {
    upVotes: initialUpVotes,
    downVotes: initialDownVotes,
    userVote
  };

  const { upVotes, downVotes } = currentVotes;
  const totalVotes = upVotes + downVotes;
  const credibilityScore = totalVotes > 0 ? Math.round((upVotes / totalVotes) * 100) : 0;

  // Track vote changes for animations
  useEffect(() => {
    if (upVotes !== previousVotes.up || downVotes !== previousVotes.down) {
      setPreviousVotes({ up: upVotes, down: downVotes });
    }
  }, [upVotes, downVotes, previousVotes]);

  const VoteDisplay: React.FC<{ 
    count: number; 
    type: 'up' | 'down'; 
    active?: boolean;
    previous: number;
  }> = ({ count, type, active, previous }) => {
    const isUp = type === 'up';
    const changed = count !== previous;
    const delta = count - previous;

    return (
      <motion.div
        className={`flex items-center gap-1 ${
          active 
            ? isUp ? 'text-green-600' : 'text-red-600'
            : 'text-muted-foreground'
        }`}
        animate={changed ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {isUp ? (
          <ThumbsUp className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
        ) : (
          <ThumbsDown className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
        )}
        
        <motion.span 
          className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}
          key={count}
          initial={changed ? { y: -10, opacity: 0 } : {}}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {count}
        </motion.span>

        <AnimatePresence>
          {changed && delta !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8 }}
              className={`absolute text-xs font-bold ${
                delta > 0 
                  ? isUp ? 'text-green-500' : 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {delta > 0 ? '+' : ''}{delta}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <VoteDisplay 
          count={upVotes} 
          type="up" 
          active={userVote === true}
          previous={previousVotes.up}
        />
        <VoteDisplay 
          count={downVotes} 
          type="down" 
          active={userVote === false}
          previous={previousVotes.down}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <VoteDisplay 
        count={upVotes} 
        type="up" 
        active={userVote === true}
        previous={previousVotes.up}
      />
      
      <VoteDisplay 
        count={downVotes} 
        type="down" 
        active={userVote === false}
        previous={previousVotes.down}
      />

      {totalVotes > 0 && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.3 }}
          key={credibilityScore}
        >
          <Badge 
            variant={credibilityScore >= 70 ? 'default' : credibilityScore >= 40 ? 'secondary' : 'destructive'}
            className="font-medium"
          >
            {credibilityScore}% credible
          </Badge>
        </motion.div>
      )}
    </div>
  );
};