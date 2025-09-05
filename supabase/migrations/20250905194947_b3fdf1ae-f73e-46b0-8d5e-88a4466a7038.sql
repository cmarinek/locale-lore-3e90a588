-- Check if user_settings table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_settings') THEN
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
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id)
        );
        
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_statistics') THEN
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
          last_activity TIMESTAMPTZ DEFAULT now(),
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE(user_id)
        );
        
        ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;