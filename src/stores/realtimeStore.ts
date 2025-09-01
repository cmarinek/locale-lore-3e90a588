import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeState {
  // Vote updates
  factVotes: Map<string, { upVotes: number; downVotes: number; userVote?: boolean | null }>;
  commentVotes: Map<string, { upVotes: number; downVotes: number; userVote?: boolean | null }>;
  
  // Live counts
  liveCounts: Map<string, { viewers: number; comments: number; shares: number }>;
  
  // Search suggestions
  trendingSearches: string[];
  searchSuggestions: Map<string, string[]>;
  
  // Collaborative editing
  activeEditors: Map<string, string[]>; // fact_id -> user_ids
  
  // Actions
  updateFactVotes: (factId: string, votes: { upVotes: number; downVotes: number; userVote?: boolean | null }) => void;
  updateCommentVotes: (commentId: string, votes: { upVotes: number; downVotes: number; userVote?: boolean | null }) => void;
  updateLiveCount: (factId: string, type: 'viewers' | 'comments' | 'shares', delta: number) => void;
  setTrendingSearches: (searches: string[]) => void;
  updateSearchSuggestions: (query: string, suggestions: string[]) => void;
  addActiveEditor: (factId: string, userId: string) => void;
  removeActiveEditor: (factId: string, userId: string) => void;
  
  // Real-time subscriptions management
  subscriptions: Map<string, any>;
  addSubscription: (key: string, subscription: any) => void;
  removeSubscription: (key: string) => void;
  clearAllSubscriptions: () => void;
}

export const useRealtimeStore = create<RealtimeState>()(
  devtools(
    (set, get) => ({
      // Initial state
      factVotes: new Map(),
      commentVotes: new Map(),
      liveCounts: new Map(),
      trendingSearches: [],
      searchSuggestions: new Map(),
      activeEditors: new Map(),
      subscriptions: new Map(),

      // Vote updates
      updateFactVotes: (factId, votes) => {
        set((state) => {
          const newFactVotes = new Map(state.factVotes);
          newFactVotes.set(factId, votes);
          return { factVotes: newFactVotes };
        });
      },

      updateCommentVotes: (commentId, votes) => {
        set((state) => {
          const newCommentVotes = new Map(state.commentVotes);
          newCommentVotes.set(commentId, votes);
          return { commentVotes: newCommentVotes };
        });
      },

      // Live counts
      updateLiveCount: (factId, type, delta) => {
        set((state) => {
          const newLiveCounts = new Map(state.liveCounts);
          const current = newLiveCounts.get(factId) || { viewers: 0, comments: 0, shares: 0 };
          newLiveCounts.set(factId, {
            ...current,
            [type]: Math.max(0, current[type] + delta)
          });
          return { liveCounts: newLiveCounts };
        });
      },

      // Search
      setTrendingSearches: (searches) => {
        set({ trendingSearches: searches });
      },

      updateSearchSuggestions: (query, suggestions) => {
        set((state) => {
          const newSuggestions = new Map(state.searchSuggestions);
          newSuggestions.set(query, suggestions);
          return { searchSuggestions: newSuggestions };
        });
      },

      // Collaborative editing
      addActiveEditor: (factId, userId) => {
        set((state) => {
          const newActiveEditors = new Map(state.activeEditors);
          const editors = newActiveEditors.get(factId) || [];
          if (!editors.includes(userId)) {
            newActiveEditors.set(factId, [...editors, userId]);
          }
          return { activeEditors: newActiveEditors };
        });
      },

      removeActiveEditor: (factId, userId) => {
        set((state) => {
          const newActiveEditors = new Map(state.activeEditors);
          const editors = newActiveEditors.get(factId) || [];
          const filteredEditors = editors.filter(id => id !== userId);
          if (filteredEditors.length === 0) {
            newActiveEditors.delete(factId);
          } else {
            newActiveEditors.set(factId, filteredEditors);
          }
          return { activeEditors: newActiveEditors };
        });
      },

      // Subscription management
      addSubscription: (key, subscription) => {
        set((state) => {
          const newSubscriptions = new Map(state.subscriptions);
          newSubscriptions.set(key, subscription);
          return { subscriptions: newSubscriptions };
        });
      },

      removeSubscription: (key) => {
        const { subscriptions } = get();
        const subscription = subscriptions.get(key);
        if (subscription) {
          supabase.removeChannel(subscription);
          set((state) => {
            const newSubscriptions = new Map(state.subscriptions);
            newSubscriptions.delete(key);
            return { subscriptions: newSubscriptions };
          });
        }
      },

      clearAllSubscriptions: () => {
        const { subscriptions } = get();
        subscriptions.forEach(subscription => {
          supabase.removeChannel(subscription);
        });
        set({ subscriptions: new Map() });
      }
    }),
    { name: 'realtime-store' }
  )
);

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