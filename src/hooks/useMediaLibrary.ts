import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MediaItem {
  id: string;
  filename: string;
  file_path: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  tags?: string[];
  alt_text?: string;
  caption?: string;
  uploaded_by?: string;
  created_at: string;
}

export const useMediaLibrary = (searchTerm?: string, tags?: string[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch media items
  const { data: mediaItems, isLoading } = useQuery({
    queryKey: ['media-library', searchTerm, tags],
    queryFn: async () => {
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`filename.ilike.%${searchTerm}%,alt_text.ilike.%${searchTerm}%,caption.ilike.%${searchTerm}%`);
      }

      if (tags && tags.length > 0) {
        query = query.contains('tags', tags);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MediaItem[];
    },
  });

  // Upload media
  const uploadMedia = useMutation({
    mutationFn: async (file: File) => {
      const { data: user } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `media/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      // Create database record
      const { error: dbError } = await supabase
        .from('media_library')
        .insert({
          filename: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          uploaded_by: user.user?.id,
        });

      if (dbError) throw dbError;
      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({ title: 'Media uploaded successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to upload media', description: error.message, variant: 'destructive' });
    },
  });

  // Update media metadata
  const updateMedia = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MediaItem> & { id: string }) => {
      const { error } = await supabase
        .from('media_library')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({ title: 'Media updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update media', description: error.message, variant: 'destructive' });
    },
  });

  // Delete media
  const deleteMedia = useMutation({
    mutationFn: async (item: MediaItem) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('branding')
        .remove([item.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('media_library')
        .delete()
        .eq('id', item.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({ title: 'Media deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete media', description: error.message, variant: 'destructive' });
    },
  });

  // Bulk delete
  const bulkDeleteMedia = useMutation({
    mutationFn: async (items: MediaItem[]) => {
      const paths = items.map(item => item.file_path);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('branding')
        .remove(paths);

      if (storageError) throw storageError;

      // Delete from database
      const ids = items.map(item => item.id);
      const { error: dbError } = await supabase
        .from('media_library')
        .delete()
        .in('id', ids);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
      toast({ title: 'Media deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to delete media', description: error.message, variant: 'destructive' });
    },
  });

  return {
    mediaItems,
    isLoading,
    uploadMedia: uploadMedia.mutate,
    updateMedia: updateMedia.mutate,
    deleteMedia: deleteMedia.mutate,
    bulkDeleteMedia: bulkDeleteMedia.mutate,
    isUploading: uploadMedia.isPending,
    isUpdating: updateMedia.isPending,
    isDeleting: deleteMedia.isPending,
  };
};
