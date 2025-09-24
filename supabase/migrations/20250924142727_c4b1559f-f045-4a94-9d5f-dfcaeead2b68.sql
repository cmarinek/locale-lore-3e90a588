-- Fix all security issues - handle existing policies properly

-- 1. Enable RLS on any tables that don't have it enabled
DO $$
BEGIN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN
    NULL; -- RLS already enabled
END $$;

DO $$
BEGIN
    ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN
    NULL; -- RLS already enabled
END $$;

DO $$
BEGIN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN
    NULL; -- RLS already enabled
END $$;

-- 2. Add privacy column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 3. Fix profiles table policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles" 
ON public.profiles FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Fix user_statistics table policies
DROP POLICY IF EXISTS "Everyone can view user statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Users can view their own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "System can manage user statistics" ON public.user_statistics;

CREATE POLICY "Users can view their own statistics" 
ON public.user_statistics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" 
ON public.user_statistics FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage user statistics" 
ON public.user_statistics FOR ALL 
USING (true);

-- 5. Fix user_roles table policies
DROP POLICY IF EXISTS "Everyone can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
ON public.user_roles FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- 6. Fix function search_path issues
CREATE OR REPLACE FUNCTION public.update_story_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- 7. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- 8. Enable RLS on all public tables (excluding system tables)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns')
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- RLS already enabled
        END;
    END LOOP;
END $$;