// Realtime store helpers - moved to separate file to prevent early execution
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeStore } from './realtimeStore';

// Helper function to set up fact vote subscription
export const setupFactVoteSubscription = (factId: string) => {
  const store = useRealtimeStore.getState();
  
  const channel = supabase
    .channel(`fact-votes-${factId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `fact_id=eq.${factId}`
      },
      async () => {
        // Fetch updated vote counts
        const { data } = await supabase
          .from('facts')
          .select('vote_count_up, vote_count_down')
          .eq('id', factId)
          .single();

        if (data) {
          store.updateFactVotes(factId, {
            upVotes: data.vote_count_up,
            downVotes: data.vote_count_down
          });
        }
      }
    )
    .subscribe();

  store.addSubscription(`fact-votes-${factId}`, channel);
  return channel;
};

// Helper function to set up comment vote subscription
export const setupCommentVoteSubscription = (commentId: string) => {
  const store = useRealtimeStore.getState();
  
  const channel = supabase
    .channel(`comment-votes-${commentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comment_votes',
        filter: `comment_id=eq.${commentId}`
      },
      async () => {
        // Fetch updated vote counts
        const { data } = await supabase
          .from('fact_comments')
          .select('vote_count_up, vote_count_down')
          .eq('id', commentId)
          .single();

        if (data) {
          store.updateCommentVotes(commentId, {
            upVotes: data.vote_count_up,
            downVotes: data.vote_count_down
          });
        }
      }
    )
    .subscribe();

  store.addSubscription(`comment-votes-${commentId}`, channel);
  return channel;
};

// Helper function to set up live viewer tracking
export const setupLiveViewerTracking = (factId: string) => {
  const store = useRealtimeStore.getState();
  
  const channel = supabase
    .channel(`fact-viewers-${factId}`)
    .on('presence', { event: 'sync' }, () => {
      const presences = channel.presenceState();
      const viewerCount = Object.keys(presences).length;
      store.updateLiveCount(factId, 'viewers', viewerCount - (store.liveCounts.get(factId)?.viewers || 0));
    })
    .subscribe();

  // Track current user as viewer
  const trackUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await channel.track({
        user_id: user.id,
        viewing_fact: factId,
        timestamp: new Date().toISOString()
      });
    }
  };

  trackUser();
  store.addSubscription(`fact-viewers-${factId}`, channel);
  return channel;
};