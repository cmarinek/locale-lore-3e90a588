import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';

interface VoteState {
  vote_count_up: number;
  vote_count_down: number;
  userVote: boolean | null;
}

export const useOptimisticVote = (
  factId: string,
  initialUpVotes: number = 0,
  initialDownVotes: number = 0,
  initialUserVote: boolean | null = null
) => {
  const { user } = useAuth();
  const [voteState, setVoteState] = useState<VoteState>({
    vote_count_up: initialUpVotes,
    vote_count_down: initialDownVotes,
    userVote: initialUserVote,
  });
  const [isVoting, setIsVoting] = useState(false);

  const vote = useCallback(async (isUpvote: boolean) => {
    if (!user || isVoting) return;

    const previousState = { ...voteState };
    const wasCurrentVote = voteState.userVote === isUpvote;
    const newUserVote = wasCurrentVote ? null : isUpvote;

    // Calculate optimistic vote counts
    let newUpVotes = voteState.vote_count_up;
    let newDownVotes = voteState.vote_count_down;

    // Remove previous vote if exists
    if (voteState.userVote === true) newUpVotes--;
    if (voteState.userVote === false) newDownVotes--;

    // Add new vote if not removing
    if (newUserVote === true) newUpVotes++;
    if (newUserVote === false) newDownVotes++;

    // Optimistic update
    setVoteState({
      vote_count_up: newUpVotes,
      vote_count_down: newDownVotes,
      userVote: newUserVote,
    });

    setIsVoting(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-vote', {
        body: { factId, isUpvote },
      });

      if (error) throw error;

      // Update with server response if available
      if (data?.vote_count_up !== undefined && data?.vote_count_down !== undefined) {
        setVoteState({
          vote_count_up: data.vote_count_up,
          vote_count_down: data.vote_count_down,
          userVote: newUserVote,
        });
      }

      if (!wasCurrentVote) {
        toast.success(isUpvote ? 'Upvoted!' : 'Downvoted!');
      }
    } catch (error: any) {
      // Revert on error
      setVoteState(previousState);
      console.error('Vote error:', error);
      toast.error(error.message || 'Failed to record vote');
    } finally {
      setIsVoting(false);
    }
  }, [user, factId, voteState, isVoting]);

  const upvote = useCallback(() => vote(true), [vote]);
  const downvote = useCallback(() => vote(false), [vote]);

  const voteScore = voteState.vote_count_up - voteState.vote_count_down;

  return {
    vote_count_up: voteState.vote_count_up,
    vote_count_down: voteState.vote_count_down,
    userVote: voteState.userVote,
    voteScore,
    upvote,
    downvote,
    isVoting,
  };
};
