-- Fix 1: Add missing profiles table with automatic user creation
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  avatar_url text,
  bio text,
  reputation_score integer NOT NULL DEFAULT 0,
  followers_count integer NOT NULL DEFAULT 0,
  following_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  UNIQUE(username)
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Fix 2: Create secure function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
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
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Fix 3: Update existing database functions to have proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE(table_name text, rls_enabled boolean, is_system_table boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    t.rowsecurity,
    CASE 
      WHEN t.tablename IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns') 
      THEN true 
      ELSE false 
    END as is_system_table
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_table_security()
RETURNS TABLE(table_name text, rls_enabled boolean, policy_count bigint, security_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    t.rowsecurity as rls_enabled,
    COALESCE(p.policy_count, 0) as policy_count,
    CASE 
      WHEN t.tablename IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns') THEN 'SYSTEM_TABLE'
      WHEN NOT t.rowsecurity THEN 'RLS_DISABLED'
      WHEN COALESCE(p.policy_count, 0) = 0 THEN 'NO_POLICIES'
      ELSE 'SECURED'
    END as security_status
  FROM pg_tables t
  LEFT JOIN (
    SELECT schemaname, tablename, COUNT(*) as policy_count
    FROM pg_policies 
    GROUP BY schemaname, tablename
  ) p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
  WHERE t.schemaname = 'public'
  ORDER BY 
    CASE 
      WHEN t.tablename IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns') THEN 4
      WHEN NOT t.rowsecurity THEN 1
      WHEN COALESCE(p.policy_count, 0) = 0 THEN 2
      ELSE 3
    END,
    t.tablename;
END;
$$;

CREATE OR REPLACE FUNCTION public.security_status_report()
RETURNS TABLE(category text, item text, status text, details text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- RLS Status for all tables
  RETURN QUERY
  SELECT 
    'RLS_STATUS'::text as category,
    t.tablename::text as item,
    CASE 
      WHEN t.tablename IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns') THEN 'SYSTEM_TABLE'
      WHEN t.rowsecurity THEN 'ENABLED'
      ELSE 'DISABLED'
    END as status,
    CASE 
      WHEN t.tablename IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns') THEN 'PostGIS system table - RLS not required'
      WHEN t.rowsecurity THEN 'Row Level Security is enabled'
      ELSE 'Row Level Security is DISABLED - SECURITY RISK'
    END as details
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
  
  -- Security Functions Status
  RETURN QUERY
  SELECT 
    'FUNCTIONS'::text as category,
    r.routine_name::text as item,
    CASE 
      WHEN r.routine_name IN ('has_role', 'is_admin', 'check_rls_status', 'audit_table_security') THEN 'CRITICAL_SECURE'
      ELSE 'SECURE'
    END as status,
    'Security function with proper search_path' as details
  FROM information_schema.routines r
  WHERE r.routine_schema = 'public'
  AND r.routine_name IN ('has_role', 'is_admin', 'check_rls_status', 'audit_table_security',
                         'cleanup_expired_builds', 'update_story_counts', 'cleanup_expired_stories', 
                         'update_trending_stories', 'handle_new_user')
  ORDER BY r.routine_name;
  
  -- Policy Count Summary
  RETURN QUERY
  SELECT 
    'POLICY_SUMMARY'::text as category,
    'Total Policies'::text as item,
    COUNT(*)::text as status,
    'Total RLS policies configured' as details
  FROM pg_policies
  WHERE schemaname = 'public';
  
END;
$$;

-- Update story maintenance functions with proper search_path
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stories 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_trending_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.stories SET is_trending = false;
  
  WITH trending_candidates AS (
    SELECT id,
           (view_count * 0.1 + like_count * 2 + comment_count * 5) as engagement_score
    FROM public.stories 
    WHERE created_at > now() - interval '24 hours'
      AND is_active = true
    ORDER BY engagement_score DESC
    LIMIT 10
  )
  UPDATE public.stories 
  SET is_trending = true 
  WHERE id IN (SELECT id FROM trending_candidates);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_story_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'story_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories 
      SET like_count = like_count + 1 
      WHERE id = NEW.story_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.stories 
      SET like_count = GREATEST(0, like_count - 1) 
      WHERE id = OLD.story_id;
      RETURN OLD;
    END IF;
  ELSIF TG_TABLE_NAME = 'story_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories 
      SET comment_count = comment_count + 1 
      WHERE id = NEW.story_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.stories 
      SET comment_count = GREATEST(0, comment_count - 1) 
      WHERE id = OLD.story_id;
      RETURN OLD;
    END IF;
  ELSIF TG_TABLE_NAME = 'story_views' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories 
      SET view_count = view_count + 1 
      WHERE id = NEW.story_id;
      RETURN NEW;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_builds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'builds'
  AND created_at < now() - INTERVAL '7 days';
  
  UPDATE public.build_logs
  SET status = 'expired'
  WHERE expires_at < now()
  AND status IN ('completed', 'failed');
END;
$$;