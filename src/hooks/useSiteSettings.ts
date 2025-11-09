import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BrandingSettings {
  logo_url: string;
  favicon_url: string;
  site_name: string;
}

interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
}

export const useSiteSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch branding settings
  const { data: branding, isLoading: brandingLoading } = useQuery({
    queryKey: ['site-settings', 'branding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'branding')
        .single();

      if (error) throw error;
      return data?.setting_value as unknown as BrandingSettings;
    },
  });

  // Fetch theme settings
  const { data: theme, isLoading: themeLoading } = useQuery({
    queryKey: ['site-settings', 'theme'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'theme')
        .single();

      if (error) throw error;
      return data?.setting_value as unknown as ThemeSettings;
    },
  });

  // Update branding
  const updateBranding = useMutation({
    mutationFn: async (newBranding: Partial<BrandingSettings>) => {
      const currentBranding = branding || { logo_url: '/logo.png', favicon_url: '/favicon.png', site_name: 'LocaleLore' };
      const updatedBranding = { ...currentBranding, ...newBranding };

      const { error } = await supabase
        .from('site_settings')
        .update({ 
          setting_value: updatedBranding,
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('setting_key', 'branding');

      if (error) throw error;
      return updatedBranding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'branding'] });
      toast({ title: 'Branding updated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update branding', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Upload logo to storage
  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onSuccess: (url) => {
      updateBranding.mutate({ logo_url: url });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to upload logo', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Upload favicon
  const uploadFavicon = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      return publicUrl;
    },
    onSuccess: (url) => {
      updateBranding.mutate({ favicon_url: url });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to upload favicon', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  return {
    branding,
    theme,
    isLoading: brandingLoading || themeLoading,
    updateBranding: updateBranding.mutate,
    uploadLogo: uploadLogo.mutate,
    uploadFavicon: uploadFavicon.mutate,
    isUploading: uploadLogo.isPending || uploadFavicon.isPending,
  };
};
