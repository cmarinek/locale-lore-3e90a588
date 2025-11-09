import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SEOConfig {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface SocialConfig {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
}

interface ContactConfig {
  email: string;
  phone: string;
  address: string;
}

interface AnalyticsConfig {
  google_analytics_id: string;
  facebook_pixel_id: string;
  plausible_domain: string;
}

interface ThemeColorsConfig {
  primary: string;
  secondary: string;
  accent: string;
}

export const useSiteConfiguration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SEO config
  const { data: seoConfig, isLoading: seoLoading } = useQuery({
    queryKey: ['site-config', 'seo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('config_value')
        .eq('config_key', 'seo')
        .single();

      if (error) throw error;
      return data?.config_value as unknown as SEOConfig;
    },
  });

  // Fetch social config
  const { data: socialConfig, isLoading: socialLoading } = useQuery({
    queryKey: ['site-config', 'social'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('config_value')
        .eq('config_key', 'social')
        .single();

      if (error) throw error;
      return data?.config_value as unknown as SocialConfig;
    },
  });

  // Fetch contact config
  const { data: contactConfig, isLoading: contactLoading } = useQuery({
    queryKey: ['site-config', 'contact'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('config_value')
        .eq('config_key', 'contact')
        .single();

      if (error) throw error;
      return data?.config_value as unknown as ContactConfig;
    },
  });

  // Fetch analytics config
  const { data: analyticsConfig, isLoading: analyticsLoading } = useQuery({
    queryKey: ['site-config', 'analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('config_value')
        .eq('config_key', 'analytics')
        .single();

      if (error) throw error;
      return data?.config_value as unknown as AnalyticsConfig;
    },
  });

  // Fetch theme colors
  const { data: themeColors, isLoading: themeLoading } = useQuery({
    queryKey: ['site-config', 'theme_colors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('config_value')
        .eq('config_key', 'theme_colors')
        .single();

      if (error) throw error;
      return data?.config_value as unknown as ThemeColorsConfig;
    },
  });

  // Update config mutation
  const updateConfig = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('site_configuration')
        .update({ 
          config_value: value,
          updated_by: user.user?.id 
        })
        .eq('config_key', key);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['site-config', variables.key] });
      toast({ title: 'Configuration updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update configuration', description: error.message, variant: 'destructive' });
    },
  });

  return {
    seoConfig,
    socialConfig,
    contactConfig,
    analyticsConfig,
    themeColors,
    isLoading: seoLoading || socialLoading || contactLoading || analyticsLoading || themeLoading,
    updateConfig: updateConfig.mutate,
    isUpdating: updateConfig.isPending,
  };
};
