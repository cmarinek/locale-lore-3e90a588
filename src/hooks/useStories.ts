import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Story, QuickCaptureData } from '@/types/stories';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedStories: Story[] = (data || []).map(story => ({
        id: story.id,
        user_id: story.user_id,
        title: story.title,
        content: story.content,
        media_urls: story.media_urls || [],
        media_type: story.media_type as 'image' | 'video' | 'carousel',
        location_name: story.location_name,
        latitude: story.latitude ? Number(story.latitude) : undefined,
        longitude: story.longitude ? Number(story.longitude) : undefined,
        hashtags: story.hashtags || [],
        expires_at: story.expires_at,
        view_count: story.view_count,
        like_count: story.like_count,
        comment_count: story.comment_count,
        is_trending: story.is_trending,
        created_at: story.created_at,
        author: story.profiles ? {
          id: story.user_id,
          username: (story.profiles as any).username,
          avatar_url: (story.profiles as any).avatar_url
        } : undefined
      }));

      setStories(transformedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error",
        description: "Failed to load stories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .eq('is_active', true)
        .eq('is_trending', true)
        .gte('expires_at', new Date().toISOString())
        .order('like_count', { ascending: false });

      if (error) throw error;

      const transformedStories: Story[] = (data || []).map(story => ({
        id: story.id,
        user_id: story.user_id,
        title: story.title,
        content: story.content,
        media_urls: story.media_urls || [],
        media_type: story.media_type as 'image' | 'video' | 'carousel',
        location_name: story.location_name,
        latitude: story.latitude ? Number(story.latitude) : undefined,
        longitude: story.longitude ? Number(story.longitude) : undefined,
        hashtags: story.hashtags || [],
        expires_at: story.expires_at,
        view_count: story.view_count,
        like_count: story.like_count,
        comment_count: story.comment_count,
        is_trending: story.is_trending,
        created_at: story.created_at,
        author: story.profiles ? {
          id: story.user_id,
          username: (story.profiles as any).username,
          avatar_url: (story.profiles as any).avatar_url
        } : undefined
      }));

      return transformedStories;
    } catch (error) {
      console.error('Error fetching trending stories:', error);
      return [];
    }
  };

  const createStory = async (data: QuickCaptureData) => {
    if (!user) throw new Error('User not authenticated');

    setSubmitting(true);
    try {
      // Upload media to Supabase Storage
      const fileExt = data.media.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `stories/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, data.media);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      // Create story record
      const { data: story, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: data.caption.split('\n')[0] || 'New Story',
          content: data.caption,
          media_urls: [publicUrl],
          media_type: data.mediaType as 'image' | 'video' | 'carousel',
          location_name: data.location?.name,
          latitude: data.location?.latitude,
          longitude: data.location?.longitude,
          hashtags: data.hashtags
        })
        .select(`
          *,
          profiles (
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      const newStory: Story = {
        id: story.id,
        user_id: story.user_id,
        title: story.title,
        content: story.content,
        media_urls: story.media_urls || [],
        media_type: story.media_type as 'image' | 'video' | 'carousel',
        location_name: story.location_name,
        latitude: story.latitude ? Number(story.latitude) : undefined,
        longitude: story.longitude ? Number(story.longitude) : undefined,
        hashtags: story.hashtags || [],
        expires_at: story.expires_at,
        view_count: story.view_count,
        like_count: story.like_count,
        comment_count: story.comment_count,
        is_trending: story.is_trending,
        created_at: story.created_at,
        author: story.profiles ? {
          id: story.user_id,
          username: (story.profiles as any).username,
          avatar_url: (story.profiles as any).avatar_url
        } : undefined
      };

      setStories(prev => [newStory, ...prev]);
      
      toast({
        title: "Success",
        description: "Story shared successfully!"
      });

      return newStory;
    } catch (error) {
      console.error('Error creating story:', error);
      toast({
        title: "Error",
        description: "Failed to share story",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const trackView = async (storyId: string) => {
    try {
      await supabase
        .from('story_views')
        .insert({
          story_id: storyId,
          user_id: user?.id,
          session_id: sessionStorage.getItem('sessionId') || 'anonymous'
        });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const likeStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('story_likes')
        .insert({
          user_id: user.id,
          story_id: storyId
        });

      if (error) throw error;

      // Update local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, like_count: story.like_count + 1 }
          : story
      ));

      toast({
        title: "Liked!",
        description: "Story liked successfully"
      });
    } catch (error) {
      console.error('Error liking story:', error);
      toast({
        title: "Error",
        description: "Failed to like story",
        variant: "destructive"
      });
    }
  };

  const unlikeStory = async (storyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('story_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('story_id', storyId);

      if (error) throw error;

      // Update local state
      setStories(prev => prev.map(story => 
        story.id === storyId 
          ? { ...story, like_count: Math.max(0, story.like_count - 1) }
          : story
      ));

      toast({
        title: "Unliked",
        description: "Story unliked"
      });
    } catch (error) {
      console.error('Error unliking story:', error);
      toast({
        title: "Error",
        description: "Failed to unlike story",
        variant: "destructive"
      });
    }
  };

  const checkIfLiked = async (storyId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('story_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('story_id', storyId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      return !!data;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    stories,
    loading,
    submitting,
    fetchStories,
    fetchTrendingStories,
    createStory,
    trackView,
    likeStory,
    unlikeStory,
    checkIfLiked
  };
};