import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote: boolean | null;
  onUpvote: () => void;
  onDownvote: () => void;
  isVoting?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  showCounts?: boolean;
  className?: string;
}

export const VoteButtons = ({
  upvotes,
  downvotes,
  userVote,
  onUpvote,
  onDownvote,
  isVoting = false,
  disabled = false,
  size = 'default',
  showCounts = true,
  className
}: VoteButtonsProps) => {
  const buttonSize = size === 'sm' ? 'h-7 px-2' : size === 'lg' ? 'h-10 px-4' : 'h-8 px-3';
  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onUpvote}
        disabled={disabled || isVoting}
        className={cn(
          buttonSize,
          'relative',
          userVote === true && 'text-green-600 bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30'
        )}
      >
        {isVoting && userVote === true ? (
          <Loader2 className={cn(iconSize, 'animate-spin mr-1')} />
        ) : (
          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <ThumbsUp className={cn(iconSize, showCounts && 'mr-1')} />
          </motion.div>
        )}
        {showCounts && (
          <motion.span
            key={upvotes}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-medium"
          >
            {upvotes}
          </motion.span>
        )}
        {userVote === true && !isVoting && (
          <motion.div
            className="absolute inset-0 rounded-md bg-green-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onDownvote}
        disabled={disabled || isVoting}
        className={cn(
          buttonSize,
          'relative',
          userVote === false && 'text-red-600 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30'
        )}
      >
        {isVoting && userVote === false ? (
          <Loader2 className={cn(iconSize, 'animate-spin mr-1')} />
        ) : (
          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <ThumbsDown className={cn(iconSize, showCounts && 'mr-1')} />
          </motion.div>
        )}
        {showCounts && (
          <motion.span
            key={downvotes}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-medium"
          >
            {downvotes}
          </motion.span>
        )}
        {userVote === false && !isVoting && (
          <motion.div
            className="absolute inset-0 rounded-md bg-red-500/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </Button>
    </div>
  );
};

export const VoteScore = ({ 
  score, 
  className 
}: { 
  score: number; 
  className?: string;
}) => {
  const isPositive = score > 0;
  const isNegative = score < 0;

  return (
    <motion.div
      key={score}
      initial={{ scale: 1.2, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'text-sm font-semibold px-2 py-1 rounded-md',
        isPositive && 'text-green-600 bg-green-100 dark:bg-green-900/20',
        isNegative && 'text-red-600 bg-red-100 dark:bg-red-900/20',
        !isPositive && !isNegative && 'text-muted-foreground',
        className
      )}
    >
      {isPositive && '+'}
      {score}
    </motion.div>
  );
};
