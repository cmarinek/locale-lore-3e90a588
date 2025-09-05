-- ============================================================
-- CRITICAL SECURITY FIXES FOR PRODUCTION READINESS - PART 2
-- ============================================================

-- 1. DROP AND RECREATE CONFLICTING FUNCTIONS
-- ============================================================

-- Drop existing functions that may conflict
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role_type);
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- 2. ENABLE RLS ON ALL USER-FACING TABLES
-- ============================================================

-- Enable RLS on all tables that should have it (excluding PostGIS system tables)
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
        -- Check if RLS is already enabled
        IF NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = tbl.tablename
            AND n.nspname = tbl.schemaname
            AND c.relrowsecurity = true
        ) THEN
            EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
            RAISE NOTICE 'Enabled RLS on table: %.%', tbl.schemaname, tbl.tablename;
        END IF;
    END LOOP;
END $$;

-- 3. CREATE SECURE HELPER FUNCTIONS WITH PROPER SEARCH PATHS
-- ============================================================

-- Create user role checking function with security definer
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

-- 4. FIX ALL DATABASE FUNCTIONS WITH PROPER SEARCH PATHS
-- ============================================================

-- Update check_rls_status function
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

-- Update cleanup_expired_builds function
CREATE OR REPLACE FUNCTION public.cleanup_expired_builds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Delete expired build files from storage
  DELETE FROM storage.objects
  WHERE bucket_id = 'builds'
  AND created_at < now() - INTERVAL '7 days';
  
  -- Update expired build records
  UPDATE public.build_logs
  SET status = 'expired'
  WHERE expires_at < now()
  AND status IN ('completed', 'failed');
END;
$$;

-- Update story count trigger function
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

-- Update cleanup expired stories function
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

-- Update trending stories function
CREATE OR REPLACE FUNCTION public.update_trending_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Reset all trending flags
  UPDATE public.stories SET is_trending = false;
  
  -- Mark top engaging stories from last 24 hours as trending
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

-- 6. CREATE MISSING TABLES FOR COMPLETE SECURITY
-- ============================================================

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'user',
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create user_activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    activity_type text NOT NULL,
    metadata jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on user_activity_log
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- 7. CREATE ESSENTIAL RLS POLICIES
-- ============================================================

-- User roles policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
    FOR ALL USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- User activity log policies
DROP POLICY IF EXISTS "Users can view their own activity" ON public.user_activity_log;
CREATE POLICY "Users can view their own activity" ON public.user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own activity" ON public.user_activity_log;
CREATE POLICY "Users can insert their own activity" ON public.user_activity_log
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all activity" ON public.user_activity_log;
CREATE POLICY "Admins can view all activity" ON public.user_activity_log
    FOR SELECT USING (public.is_admin(auth.uid()));

-- 8. FINAL SECURITY VALIDATION
-- ============================================================

-- Test the security functions work
DO $$
BEGIN
    -- Test that our audit function works
    PERFORM * FROM public.audit_table_security() LIMIT 1;
    RAISE NOTICE 'Security audit function working correctly';
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Security audit function test failed: %', SQLERRM;
END $$;