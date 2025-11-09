import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  background_color?: string;
  text_color?: string;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  created_at: string;
}

export const useAnnouncements = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch active announcement for display
  const { data: activeAnnouncement } = useQuery({
    queryKey: ['active-announcement'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_announcements')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Announcement | null;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch all announcements (admin)
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
  });

  // Create announcement
  const createAnnouncement = useMutation({
    mutationFn: async (announcement: Omit<Announcement, 'id' | 'created_at'>) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('site_announcements')
        .insert({ ...announcement, created_by: user.user?.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcement'] });
      toast({ title: 'Announcement created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create announcement', description: error.message, variant: 'destructive' });
    },
  });

  // Update announcement
  const updateAnnouncement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Announcement> & { id: string }) => {
      const { error } = await supabase
        .from('site_announcements')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcement'] });
      toast({ title: 'Announcement updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update announcement', description: error.message, variant: 'destructive' });
    },
  });

  // Delete announcement
  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('site_announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      queryClient.invalidateQueries({ queryKey: ['active-announcement'] });
      toast({ title: 'Announcement deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete announcement', description: error.message, variant: 'destructive' });
    },
  });

  return {
    activeAnnouncement,
    announcements,
    isLoading,
    createAnnouncement: createAnnouncement.mutate,
    updateAnnouncement: updateAnnouncement.mutate,
    deleteAnnouncement: deleteAnnouncement.mutate,
    isCreating: createAnnouncement.isPending,
    isUpdating: updateAnnouncement.isPending,
    isDeleting: deleteAnnouncement.isPending,
  };
};
