import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ThumbsUp, ThumbsDown, Reply, MoreHorizontal, Flag, Edit2, Trash2, Crown } from 'lucide-react';
import { Card } from '@/components/ui/ios-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/ios-badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface Comment {
  id: string;
  content: string;
  author_id: string;
  parent_id?: string;
  depth: number;
  vote_count_up: number;
  vote_count_down: number;
  reply_count: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  } | null;
  user_vote?: boolean | null;
  replies?: Comment[];
  isOptimistic?: boolean;
}

interface DiscussionThreadProps {
  factId: string;
  className?: string;
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  factId,
  className = ""
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [isContributor, setIsContributor] = useState<boolean>(false);

  useEffect(() => {
    fetchComments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel(`fact-comments-${factId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fact_comments',
          filter: `fact_id=eq.${factId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [factId]);

  const fetchComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('fact_comments')
        .select(`
          *,
          profiles!fact_comments_author_id_fkey(
            username,
            avatar_url
          )
        `)
        .eq('fact_id', factId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user votes for comments if user is logged in
      if (user && commentsData) {
        const commentIds = commentsData.map(c => c.id);
        const { data: votes } = await supabase
          .from('comment_votes')
          .select('comment_id, is_upvote')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const voteMap = new Map(votes?.map(v => [v.comment_id, v.is_upvote]) || []);
        
        commentsData.forEach((comment: any) => {
          comment.user_vote = voteMap.get(comment.id) ?? null;
        });
      }

      // Build nested structure - transform the data to match our Comment interface
      const transformedComments: Comment[] = (commentsData || []).map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        author_id: comment.author_id,
        parent_id: comment.parent_id,
        depth: comment.depth,
        vote_count_up: comment.vote_count_up,
        vote_count_down: comment.vote_count_down,
        reply_count: comment.reply_count,
        created_at: comment.created_at,
        profiles: comment.profiles,
        user_vote: comment.user_vote,
        replies: []
      }));
      
      const nested = buildNestedComments(transformedComments);
      setComments(nested);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Don't show toast for comment loading errors - it's expected when there are no comments
    } finally {
      setLoading(false);
    }
  };

  const buildNestedComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // Initialize all comments with empty replies array
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Build the nested structure
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const submitComment = async () => {
    if (!user || !newComment.trim() || submitting) return;

    // Check if user has contributor subscription
    try {
      const { data: subCheck } = await supabase.functions.invoke('check-subscription', {
        body: { user_id: user.id }
      });
      
      if (!subCheck?.subscribed) {
        toast({
          title: "Contributor Required",
          description: "Only contributors can create comments. Upgrade to contribute!",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Unable to verify subscription status",
        variant: "destructive"
      });
      return;
    }

    // Optimistic comment
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticComment: Comment = {
      id: optimisticId,
      content: newComment.trim(),
      author_id: user.id,
      parent_id: replyTo,
      depth: replyTo ? 1 : 0,
      vote_count_up: 0,
      vote_count_down: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
      profiles: {
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url,
      },
      user_vote: null,
      isOptimistic: true,
      replies: []
    };

    // Add optimistically
    if (replyTo) {
      // Add as a reply
      const updateCommentsWithReply = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === replyTo) {
            return {
              ...comment,
              replies: [optimisticComment, ...(comment.replies || [])]
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: updateCommentsWithReply(comment.replies)
            };
          }
          return comment;
        });
      };
      setComments(updateCommentsWithReply(comments));
    } else {
      // Add as top-level comment
      setComments([optimisticComment, ...comments]);
    }

    const commentText = newComment.trim();
    setNewComment('');
    setReplyTo(null);
    setSubmitting(true);

    try {
      const { data: insertedComment, error } = await supabase
        .from('fact_comments')
        .insert({
          fact_id: factId,
          author_id: user.id,
          content: commentText,
          parent_id: replyTo,
          depth: replyTo ? 1 : 0
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

      // Replace optimistic with real comment
      const replaceOptimistic = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === optimisticId) {
            return { ...insertedComment, replies: [] } as Comment;
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: replaceOptimistic(comment.replies)
            };
          }
          return comment;
        });
      };
      setComments(replaceOptimistic(comments));
      
      toast({
        title: "Comment Added",
        description: "Your comment has been posted successfully",
      });
    } catch (error: any) {
      // Remove optimistic comment on error
      const removeOptimistic = (comments: Comment[]): Comment[] => {
        return comments
          .filter(c => c.id !== optimisticId)
          .map(comment => ({
            ...comment,
            replies: comment.replies ? removeOptimistic(comment.replies) : []
          }));
      };
      setComments(removeOptimistic(comments));

      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const voteOnComment = async (commentId: string, isUpvote: boolean) => {
    if (!user) return;

    // Optimistic update first
    const updateCommentVoteOptimistic = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const oldVote = comment.user_vote;
          const newVote = oldVote === isUpvote ? null : isUpvote;
          
          let upDelta = 0;
          let downDelta = 0;
          
          if (oldVote === true && newVote !== true) upDelta = -1;
          if (oldVote === false && newVote !== false) downDelta = -1;
          if (newVote === true && oldVote !== true) upDelta = 1;
          if (newVote === false && oldVote !== false) downDelta = 1;

          return {
            ...comment,
            user_vote: newVote,
            vote_count_up: comment.vote_count_up + upDelta,
            vote_count_down: comment.vote_count_down + downDelta
          };
        }
        
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentVoteOptimistic(comment.replies)
          };
        }
        
        return comment;
      });
    };

    const previousComments = [...comments];
    setComments(updateCommentVoteOptimistic(comments));

    try {
      const { error } = await supabase
        .from('comment_votes')
        .upsert({
          comment_id: commentId,
          user_id: user.id,
          is_upvote: isUpvote
        });

      if (error) throw error;
    } catch (error) {
      // Revert on error
      setComments(previousComments);
      console.error('Error voting on comment:', error);
      toast({
        title: "Error",
        description: "Failed to record vote",
        variant: "destructive"
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const CommentComponent: React.FC<{ comment: Comment; depth?: number }> = ({ 
    comment, 
    depth = 0 
  }) => {
    const isExpanded = expandedReplies.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isReplyingTo = replyTo === comment.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`${depth > 0 ? 'ml-6 border-l-2 border-border pl-4' : ''}`}
      >
        <Card className="p-4 bg-card/50 backdrop-blur">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.profiles?.avatar_url} />
              <AvatarFallback>
                {comment.profiles?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm text-foreground">
                  {comment.profiles?.username || 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>

              <p className="text-sm text-foreground leading-relaxed">
                {comment.content}
              </p>
              
              {comment.isOptimistic && (
                <Badge variant="secondary" className="text-xs">
                  Posting...
                </Badge>
              )}

              <div className="flex items-center space-x-4">
                {/* Vote buttons */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => voteOnComment(comment.id, true)}
                    className={`h-7 px-2 ${
                      comment.user_vote === true ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : ''
                    }`}
                    disabled={!user}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {comment.vote_count_up}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => voteOnComment(comment.id, false)}
                    className={`h-7 px-2 ${
                      comment.user_vote === false ? 'text-red-600 bg-red-100 dark:bg-red-900/20' : ''
                    }`}
                    disabled={!user}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    {comment.vote_count_down}
                  </Button>
                </div>

                {/* Reply button */}
                {user && depth < 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(isReplyingTo ? null : comment.id)}
                    className="h-7 px-2"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}

                {/* Show replies toggle */}
                {hasReplies && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment.id)}
                    className="h-7 px-2"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {isExpanded ? 'Hide' : 'Show'} {comment.replies?.length} replies
                  </Button>
                )}

                {/* More options */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                      {user.id === comment.author_id && (
                        <>
                          <DropdownMenuItem>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Reply form */}
        <AnimatePresence>
          {isReplyingTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 ml-11"
            >
              <Card className="p-3 bg-muted/50">
                <Textarea
                  placeholder={`Reply to ${comment.profiles?.username || 'comment'}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3 border-0 bg-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={submitComment}
                    disabled={!newComment.trim() || submitting}
                  >
                    {submitting ? 'Posting...' : 'Reply'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nested replies */}
        <AnimatePresence>
          {isExpanded && hasReplies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3"
            >
              {comment.replies?.map((reply) => (
                <CommentComponent
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Comment form */}
      {user ? (
        <Card className="p-4 bg-card/50 backdrop-blur">
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your thoughts on this lore..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="border-0 bg-background/50 resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={submitComment}
                  disabled={!newComment.trim() || submitting}
                  size="sm"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-muted/20 border-dashed">
          <p className="text-center text-muted-foreground">
            <Button variant="link" className="p-0 h-auto text-primary">
              Sign in
            </Button>{' '}
            to join the discussion
          </p>
        </Card>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <Card className="p-8 text-center bg-muted/20 border-dashed">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No comments yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to share your thoughts on this lore!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};