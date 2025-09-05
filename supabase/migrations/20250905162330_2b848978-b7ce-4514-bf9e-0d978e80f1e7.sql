-- ============================================================
-- CRITICAL SECURITY FIXES - CLEAN APPROACH
-- ============================================================

-- 1. DROP ALL DEPENDENT POLICIES FIRST
-- ============================================================

-- Drop policies that depend on has_role function
DROP POLICY IF EXISTS "Only admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can manage category translations" ON public.category_translations;
DROP POLICY IF EXISTS "Authors can update their own facts" ON public.facts;
DROP POLICY IF EXISTS "Only admins can delete facts" ON public.facts;
DROP POLICY IF EXISTS "Authors and admins can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Only admins can manage challenges" ON public.challenges;

-- 2. DROP AND RECREATE FUNCTIONS
-- ============================================================

-- Drop existing functions with CASCADE to clear dependencies
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role_type) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(uuid) CASCADE;

-- Create new secure functions with proper search paths
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create admin helper function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- 3. ENABLE RLS ON ALL TABLES
-- ============================================================

-- Ensure all user tables have RLS enabled
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_of_the_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lore_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

-- Create missing critical tables
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role)
);

CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    activity_type text NOT NULL,
    metadata jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- 4. RECREATE ALL RLS POLICIES WITH SECURE FUNCTIONS
-- ============================================================

-- User roles policies
CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Categories policies  
CREATE POLICY "Only admins can manage categories" ON public.categories
    FOR ALL USING (public.is_admin(auth.uid()));

-- Category translations policies
CREATE POLICY "Only admins can manage category translations" ON public.category_translations
    FOR ALL USING (public.is_admin(auth.uid()));

-- Facts policies
CREATE POLICY "Authors can update their own facts" ON public.facts
    FOR UPDATE USING ((auth.uid() = author_id) OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete facts" ON public.facts
    FOR DELETE USING (public.is_admin(auth.uid()));

-- Comments policies
CREATE POLICY "Authors and admins can delete comments" ON public.comments
    FOR DELETE USING ((auth.uid() = author_id) OR public.is_admin(auth.uid()));

-- Challenges policies
CREATE POLICY "Only admins can manage challenges" ON public.challenges
    FOR ALL USING (public.is_admin(auth.uid()));

-- User activity log policies
CREATE POLICY "Users can view their own activity" ON public.user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON public.user_activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity" ON public.user_activity_log
    FOR SELECT USING (public.is_admin(auth.uid()));

-- 5. UPDATE ALL FUNCTIONS WITH PROPER SEARCH PATHS
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE(table_name text, rls_enabled boolean, is_system_table boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.cleanup_expired_builds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.update_story_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
SET search_path = 'public'
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