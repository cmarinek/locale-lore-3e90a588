import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  fact_id: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
  isOptimistic?: boolean;
}

export const useOptimisticComments = (factId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fact_comments')
        .select(`
          *,
          profiles!fact_comments_author_id_fkey(
            username,
            avatar_url
          )
        `)
        .eq('fact_id', factId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter out optimistic comments and merge with server data
      setComments(prevComments => {
        const optimisticComments = prevComments.filter(c => c.isOptimistic);
        const serverComments = (data || []) as Comment[];
        return [...optimisticComments, ...serverComments];
      });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [factId]);

  // Submit comment with optimistic update
  const submitComment = useCallback(async (content: string) => {
    if (!user || !content.trim() || isSubmitting) return;

    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticComment: Comment = {
      id: optimisticId,
      content: content.trim(),
      author_id: user.id,
      fact_id: factId,
      created_at: new Date().toISOString(),
      profiles: {
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url,
      },
      isOptimistic: true,
    };

    // Optimistic update - add to beginning
    setComments(prev => [optimisticComment, ...prev]);
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('fact_comments')
        .insert({
          fact_id: factId,
          author_id: user.id,
          content: content.trim(),
        })
        .select(`
          *,
          profiles!fact_comments_author_id_fkey(
            username,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Replace optimistic comment with real one
      setComments(prev => 
        prev.map(c => c.id === optimisticId ? data as Comment : c)
      );

      toast.success('Comment posted!');
      return data;
    } catch (error: any) {
      // Remove optimistic comment on error
      setComments(prev => prev.filter(c => c.id !== optimisticId));
      console.error('Failed to submit comment:', error);
      toast.error(error.message || 'Failed to post comment');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, factId, isSubmitting]);

  // Delete comment with optimistic update
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return;

    const previousComments = [...comments];
    
    // Optimistic removal
    setComments(prev => prev.filter(c => c.id !== commentId));

    try {
      const { error } = await supabase
        .from('fact_comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;
      toast.success('Comment deleted');
    } catch (error: any) {
      // Revert on error
      setComments(previousComments);
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  }, [user, comments]);

  // Set up real-time subscription
  useEffect(() => {
    fetchComments();

    const channel = supabase
      .channel(`fact-comments-${factId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fact_comments',
          filter: `fact_id=eq.${factId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Only add if not from current user (already added optimistically)
            if (payload.new.author_id !== user?.id) {
              fetchComments();
            }
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            fetchComments();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [factId, user?.id, fetchComments]);

  return {
    comments,
    isLoading,
    isSubmitting,
    submitComment,
    deleteComment,
    refetch: fetchComments,
  };
};
