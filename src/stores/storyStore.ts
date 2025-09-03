import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

// Define the types for the stories feature
interface StoryComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { username: string; avatar_url?: string };
}

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  title?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: { username: string; avatar_url?: string };
  // Frontend-only state
  comments: StoryComment[];
  isLiked: boolean;
}

interface StoryState {
  stories: Story[];
  currentStoryIndex: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStories: () => Promise<void>;
  setCurrentStoryIndex: (index: number) => void;
  likeStory: (storyId: string) => Promise<void>;
  unlikeStory: (storyId: string) => Promise<void>;
  addComment: (storyId: string, content: string) => Promise<void>;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  stories: [],
  currentStoryIndex: 0,
  isLoading: false,
  error: null,

  fetchStories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: storiesData, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles ( username, avatar_url ),
          story_comments ( *, profiles ( username, avatar_url ) ),
          story_likes ( user_id )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();

      const stories = storiesData.map((story) => ({
        ...story,
        comments: story.story_comments,
        isLiked: story.story_likes.some((like) => like.user_id === user?.id),
      }));

      set({ stories, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setCurrentStoryIndex: (index) => set({ currentStoryIndex: index }),

  likeStory: async (storyId) => {
    // Optimistic update
    const originalStories = get().stories;
    const updatedStories = originalStories.map(s =>
      s.id === storyId ? { ...s, isLiked: true, like_count: s.like_count + 1 } : s
    );
    set({ stories: updatedStories });

    try {
      const { error } = await supabase.functions.invoke('like-story', {
        body: { story_id: storyId },
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      // Revert on failure
      set({ stories: originalStories, error: (err as Error).message });
    }
  },

  unlikeStory: async (storyId) => {
    // Optimistic update
    const originalStories = get().stories;
    const updatedStories = originalStories.map(s =>
      s.id === storyId ? { ...s, isLiked: false, like_count: s.like_count - 1 } : s
    );
    set({ stories: updatedStories });

    try {
      const { error } = await supabase.functions.invoke('unlike-story', {
        body: { story_id: storyId },
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      // Revert on failure
      set({ stories: originalStories, error: (err as Error).message });
    }
  },

  addComment: async (storyId, content) => {
    try {
      const { data: newComment, error } = await supabase.functions.invoke('comment-on-story', {
        body: { story_id: storyId, content },
      });
      if (error) throw new Error(error.message);

      // Add comment to the story's comments array
      const { data: { user } } = await supabase.auth.getUser();
      const profile = { username: user?.user_metadata.username || 'user', avatar_url: user?.user_metadata.avatar_url };

      const updatedStories = get().stories.map(s =>
        s.id === storyId ? { ...s, comments: [...s.comments, { ...newComment, profiles: profile }] } : s
      );
      set({ stories: updatedStories });

    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
