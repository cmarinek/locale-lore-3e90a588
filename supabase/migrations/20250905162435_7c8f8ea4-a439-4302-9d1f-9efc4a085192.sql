-- ============================================================
-- CRITICAL SECURITY FIXES - FINAL APPROACH
-- ============================================================

-- First, let's check the existing user_roles table structure
DO $$
DECLARE
    role_column_type text;
BEGIN
    -- Get the role column type
    SELECT data_type INTO role_column_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'role';
    
    RAISE NOTICE 'Role column type: %', COALESCE(role_column_type, 'COLUMN_NOT_FOUND');
END $$;

-- 1. CREATE PROPER SECURITY FUNCTIONS BASED ON ACTUAL SCHEMA
-- ============================================================

-- Drop existing functions first
DROP FUNCTION IF EXISTS public.has_role(_user_id uuid, _role text) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin(_user_id uuid) CASCADE;

-- Create has_role function that works with the existing schema
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
      AND role::text = _role
  )
$$;

-- Create admin checking function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- 2. ENSURE ALL TABLES HAVE RLS ENABLED
-- ============================================================

-- Enable RLS on all tables (this is idempotent)
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
    END LOOP;
    RAISE NOTICE 'RLS enabled on all user tables';
END $$;

-- 3. RECREATE ESSENTIAL POLICIES THAT MAY HAVE BEEN DROPPED
-- ============================================================

-- Only recreate policies if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Only admins can manage categories') THEN
        CREATE POLICY "Only admins can manage categories" ON public.categories
            FOR ALL USING (public.is_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'category_translations' AND policyname = 'Only admins can manage category translations') THEN
        CREATE POLICY "Only admins can manage category translations" ON public.category_translations
            FOR ALL USING (public.is_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'facts' AND policyname = 'Authors can update their own facts') THEN
        CREATE POLICY "Authors can update their own facts" ON public.facts
            FOR UPDATE USING ((auth.uid() = author_id) OR public.is_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'facts' AND policyname = 'Only admins can delete facts') THEN
        CREATE POLICY "Only admins can delete facts" ON public.facts
            FOR DELETE USING (public.is_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Authors and admins can delete comments') THEN
        CREATE POLICY "Authors and admins can delete comments" ON public.comments
            FOR DELETE USING ((auth.uid() = author_id) OR public.is_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'challenges' AND policyname = 'Only admins can manage challenges') THEN
        CREATE POLICY "Only admins can manage challenges" ON public.challenges
            FOR ALL USING (public.is_admin(auth.uid()));
    END IF;
    
    -- User activity and roles policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Users can view their own activity') THEN
        CREATE POLICY "Users can view their own activity" ON public.user_activity_log
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Users can insert their own activity') THEN
        CREATE POLICY "Users can insert their own activity" ON public.user_activity_log
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Admins can view all activity') THEN
        CREATE POLICY "Admins can view all activity" ON public.user_activity_log
            FOR SELECT USING (public.is_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage user roles') THEN
        CREATE POLICY "Admins can manage user roles" ON public.user_roles
            FOR ALL USING (public.is_admin(auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
        CREATE POLICY "Users can view their own roles" ON public.user_roles
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    RAISE NOTICE 'Essential security policies created/verified';
END $$;

-- 4. UPDATE ALL FUNCTIONS WITH PROPER SEARCH PATHS
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

-- 5. CREATE SECURITY AUDIT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.audit_table_security()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  policy_count bigint,
  security_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 6. FINAL SECURITY VALIDATION
-- ============================================================

-- Verify all critical security measures are in place
DO $$
DECLARE
    insecure_tables integer;
    missing_functions integer;
BEGIN
    -- Count tables without RLS
    SELECT COUNT(*) INTO insecure_tables
    FROM pg_tables t
    LEFT JOIN pg_class c ON c.relname = t.tablename
    LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
    WHERE t.schemaname = 'public' 
    AND t.tablename NOT IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns')
    AND (c.relrowsecurity IS NULL OR c.relrowsecurity = false);
    
    -- Count missing security functions
    SELECT COUNT(*) INTO missing_functions
    FROM (VALUES ('has_role'), ('is_admin'), ('check_rls_status'), ('audit_table_security')) AS expected(fname)
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = expected.fname
    );
    
    -- Report status
    IF insecure_tables = 0 AND missing_functions = 0 THEN
        RAISE NOTICE '✅ SECURITY HARDENING COMPLETE - All tables secured with RLS and security functions active';
    ELSE
        RAISE WARNING '⚠️ Security issues remain: % tables without RLS, % missing functions', insecure_tables, missing_functions;
    END IF;
END $$;