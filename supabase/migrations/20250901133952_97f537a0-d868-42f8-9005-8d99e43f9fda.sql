-- Create storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);

-- Create storage policies for profile images
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'auto',
  language TEXT NOT NULL DEFAULT 'en',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  in_app_notifications BOOLEAN NOT NULL DEFAULT true,
  location_sharing BOOLEAN NOT NULL DEFAULT false,
  profile_visibility TEXT NOT NULL DEFAULT 'public',
  discovery_radius INTEGER NOT NULL DEFAULT 10,
  activity_tracking BOOLEAN NOT NULL DEFAULT true,
  data_processing_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for user settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user settings
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create user activity log table
CREATE TABLE public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  location GEOMETRY(POINT, 4326),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for activity log
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activity log
CREATE POLICY "Users can view their own activity"
ON public.user_activity_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
ON public.user_activity_log FOR INSERT
WITH CHECK (true);

-- Create user statistics table
CREATE TABLE public.user_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facts_submitted INTEGER NOT NULL DEFAULT 0,
  facts_verified INTEGER NOT NULL DEFAULT 0,
  comments_made INTEGER NOT NULL DEFAULT 0,
  votes_cast INTEGER NOT NULL DEFAULT 0,
  achievements_earned INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  locations_discovered INTEGER NOT NULL DEFAULT 0,
  profile_views INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for user statistics
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user statistics
CREATE POLICY "Users can view their own statistics"
ON public.user_statistics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public statistics"
ON public.user_statistics FOR SELECT
USING (true);

CREATE POLICY "System can update statistics"
ON public.user_statistics FOR UPDATE
USING (true);

CREATE POLICY "System can insert statistics"
ON public.user_statistics FOR INSERT
WITH CHECK (true);

-- Create data export requests table
CREATE TABLE public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  export_type TEXT NOT NULL DEFAULT 'full',
  file_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for data export requests
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for data export requests
CREATE POLICY "Users can view their own export requests"
ON public.data_export_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests"
ON public.data_export_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create account deletion requests table
CREATE TABLE public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  feedback TEXT,
  scheduled_deletion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for account deletion requests
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for account deletion requests
CREATE POLICY "Users can view their own deletion requests"
ON public.account_deletion_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create deletion requests"
ON public.account_deletion_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for subscribers
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscribers
CREATE POLICY "Users can view their own subscription"
ON public.subscribers FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription"
ON public.subscribers FOR UPDATE
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "System can manage subscriptions"
ON public.subscribers FOR ALL
USING (true);

-- Create indexes for performance
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_created_at ON public.user_activity_log(created_at);
CREATE INDEX idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX idx_data_export_requests_user_id ON public.data_export_requests(user_id);
CREATE INDEX idx_account_deletion_requests_user_id ON public.account_deletion_requests(user_id);
CREATE INDEX idx_subscribers_user_id ON public.subscribers(user_id);
CREATE INDEX idx_subscribers_email ON public.subscribers(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();