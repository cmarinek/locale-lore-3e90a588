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

// Realtime helpers moved to separate file to prevent early execution issues
// Import from '@/stores/realtimeHelpers' when needed