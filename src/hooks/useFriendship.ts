import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  requested_at: string;
  responded_at?: string;
}

export function useFriendship(otherUserId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get friendship status
  const { data: friendship, isLoading } = useQuery({
    queryKey: ['friendship', user?.id, otherUserId],
    queryFn: async () => {
      if (!user?.id || !otherUserId || user.id === otherUserId) return null;

      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${user.id})`)
        .maybeSingle();

      if (error) throw error;
      return data as Friendship | null;
    },
    enabled: !!user?.id && !!otherUserId && user.id !== otherUserId,
  });

  // Send friend request
  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-friend-request', {
        body: { friendId: otherUserId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Friend request sent!' });
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Respond to friend request
  const respondMutation = useMutation({
    mutationFn: async (accept: boolean) => {
      if (!friendship?.id) throw new Error('No friendship found');

      const { data, error } = await supabase.functions.invoke('respond-friend-request', {
        body: { friendshipId: friendship.id, accept },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, accept) => {
      toast({ title: accept ? 'Friend request accepted!' : 'Friend request rejected' });
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove friend
  const removeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('remove-friend', {
        body: { friendId: otherUserId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Friend removed' });
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Block user
  const blockMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('block-user', {
        body: { userId: otherUserId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'User blocked' });
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isFriend = friendship?.status === 'accepted';
  const isPending = friendship?.status === 'pending';
  const isIncoming = isPending && friendship?.friend_id === user?.id;
  const isOutgoing = isPending && friendship?.user_id === user?.id;
  const isBlocked = friendship?.status === 'blocked';

  return {
    friendship,
    isLoading,
    isFriend,
    isPending,
    isIncoming,
    isOutgoing,
    isBlocked,
    sendRequest: sendRequestMutation.mutate,
    acceptRequest: () => respondMutation.mutate(true),
    rejectRequest: () => respondMutation.mutate(false),
    removeFriend: removeMutation.mutate,
    blockUser: blockMutation.mutate,
    isActioning: sendRequestMutation.isPending || respondMutation.isPending || removeMutation.isPending || blockMutation.isPending,
  };
}
