-- Announcements table
CREATE TABLE IF NOT EXISTS public.site_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, error
  background_color TEXT,
  text_color TEXT,
  is_active BOOLEAN DEFAULT false,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Media library table
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  tags TEXT[],
  alt_text TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Site configuration table (extended settings)
CREATE TABLE IF NOT EXISTS public.site_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_configuration ENABLE ROW LEVEL SECURITY;

-- Announcements policies
CREATE POLICY "Anyone can view active announcements"
  ON public.site_announcements
  FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage announcements"
  ON public.site_announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Media library policies
CREATE POLICY "Anyone can view media"
  ON public.media_library
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload media"
  ON public.media_library
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all media"
  ON public.media_library
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Users can manage their own media"
  ON public.media_library
  FOR UPDATE
  USING (uploaded_by = auth.uid());

-- Configuration policies
CREATE POLICY "Anyone can view configuration"
  ON public.site_configuration
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update configuration"
  ON public.site_configuration
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_site_announcements_updated_at
  BEFORE UPDATE ON public.site_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON public.media_library
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_configuration_updated_at
  BEFORE UPDATE ON public.site_configuration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.site_configuration (config_key, config_value) 
VALUES 
  ('seo', '{"meta_title": "LocaleLore - Discover Local Stories", "meta_description": "Discover fascinating local stories, culture, and hidden gems", "meta_keywords": "local stories, culture, travel"}'::jsonb),
  ('social', '{"facebook": "", "twitter": "", "instagram": "", "linkedin": ""}'::jsonb),
  ('contact', '{"email": "contact@localelore.app", "phone": "", "address": ""}'::jsonb),
  ('analytics', '{"google_analytics_id": "", "facebook_pixel_id": "", "plausible_domain": ""}'::jsonb),
  ('theme_colors', '{"primary": "#007AFF", "secondary": "#5856D6", "accent": "#FF9500"}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_site_announcements_active ON public.site_announcements(is_active, expires_at);
CREATE INDEX idx_media_library_tags ON public.media_library USING GIN(tags);
CREATE INDEX idx_media_library_uploaded_by ON public.media_library(uploaded_by);