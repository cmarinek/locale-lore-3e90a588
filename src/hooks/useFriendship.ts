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

  // Send friend request with optimistic update
  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-friend-request', {
        body: { friendId: otherUserId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['friendship', user?.id, otherUserId] });
      
      // Snapshot previous value
      const previousFriendship = queryClient.getQueryData(['friendship', user?.id, otherUserId]);
      
      // Optimistically update to pending state
      queryClient.setQueryData(['friendship', user?.id, otherUserId], {
        id: 'temp-id',
        user_id: user?.id,
        friend_id: otherUserId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });
      
      return { previousFriendship };
    },
    onSuccess: () => {
      toast({ title: 'Friend request sent!' });
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: (error: Error, _, context) => {
      // Revert on error
      queryClient.setQueryData(['friendship', user?.id, otherUserId], context?.previousFriendship);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Respond to friend request with optimistic update
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
    onMutate: async (accept) => {
      await queryClient.cancelQueries({ queryKey: ['friendship', user?.id, otherUserId] });
      
      const previousFriendship = queryClient.getQueryData(['friendship', user?.id, otherUserId]);
      
      // Optimistically update status
      if (friendship) {
        queryClient.setQueryData(['friendship', user?.id, otherUserId], {
          ...friendship,
          status: accept ? 'accepted' : 'rejected',
          responded_at: new Date().toISOString(),
        });
      }
      
      return { previousFriendship };
    },
    onSuccess: (_, accept) => {
      toast({ title: accept ? 'Friend request accepted!' : 'Friend request rejected' });
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['friendship', user?.id, otherUserId], context?.previousFriendship);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove friend with optimistic update
  const removeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('remove-friend', {
        body: { friendId: otherUserId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['friendship', user?.id, otherUserId] });
      
      const previousFriendship = queryClient.getQueryData(['friendship', user?.id, otherUserId]);
      
      // Optimistically remove friendship
      queryClient.setQueryData(['friendship', user?.id, otherUserId], null);
      
      return { previousFriendship };
    },
    onSuccess: () => {
      toast({ title: 'Friend removed' });
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['friendship', user?.id, otherUserId], context?.previousFriendship);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Block user with optimistic update
  const blockMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('block-user', {
        body: { userId: otherUserId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['friendship', user?.id, otherUserId] });
      
      const previousFriendship = queryClient.getQueryData(['friendship', user?.id, otherUserId]);
      
      // Optimistically set to blocked
      queryClient.setQueryData(['friendship', user?.id, otherUserId], {
        ...friendship,
        status: 'blocked',
      });
      
      return { previousFriendship };
    },
    onSuccess: () => {
      toast({ title: 'User blocked' });
      queryClient.invalidateQueries({ queryKey: ['friendship'] });
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(['friendship', user?.id, otherUserId], context?.previousFriendship);
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
