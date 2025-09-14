-- Create user settings and statistics tables if they don't have proper structure
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  language varchar(10) DEFAULT 'en',
  theme varchar(20) DEFAULT 'system',
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  privacy_level varchar(20) DEFAULT 'public',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_statistics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  facts_submitted integer DEFAULT 0,
  facts_verified integer DEFAULT 0,
  comments_made integer DEFAULT 0,
  votes_cast integer DEFAULT 0,
  reputation_score integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_activity timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own statistics" ON public.user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update statistics" ON public.user_statistics
  FOR UPDATE USING (true);

CREATE POLICY "System can insert statistics" ON public.user_statistics
  FOR INSERT WITH CHECK (true);

-- Recreate the handle_new_user function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  username_base text;
  username_final text;
  counter integer := 1;
BEGIN
  -- Extract username from email (before @)
  username_base := split_part(NEW.email, '@', 1);
  username_final := username_base;
  
  -- Ensure username is unique by adding number if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_final) LOOP
    username_final := username_base || counter::text;
    counter := counter + 1;
  END LOOP;
  
  -- Insert profile with generated username
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, username_final);
  
  -- Insert user settings with defaults
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  -- Insert user statistics with defaults
  INSERT INTO public.user_statistics (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Failed to create user profile/settings: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_statistics_updated_at
  BEFORE UPDATE ON public.user_statistics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();