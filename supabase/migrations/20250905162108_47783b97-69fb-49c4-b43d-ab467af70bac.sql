-- ============================================================
-- CRITICAL SECURITY FIXES FOR PRODUCTION READINESS
-- ============================================================

-- 1. ENABLE RLS ON ALL USER-FACING TABLES (if not already enabled)
-- ============================================================

-- Enable RLS on all tables that should have it
DO $$
DECLARE
    tbl record;
BEGIN
    -- List of tables that should have RLS enabled
    FOR tbl IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns')
        AND NOT EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = tablename
            AND n.nspname = schemaname
            AND c.relrowsecurity = true
        )
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', tbl.schemaname, tbl.tablename);
        RAISE NOTICE 'Enabled RLS on table: %.%', tbl.schemaname, tbl.tablename;
    END LOOP;
END $$;

-- 2. FIX FUNCTION SEARCH PATHS FOR SECURITY
-- ============================================================

-- Update all functions to have proper search_path
CREATE OR REPLACE FUNCTION public.check_rls_status()
 RETURNS TABLE(table_name text, rls_enabled boolean, is_system_table boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_builds()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_story_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.stories 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_trending_stories()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 3. CREATE SECURITY HELPER FUNCTIONS
-- ============================================================

-- Create helper function to check user roles securely
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name user_role_type)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND user_roles.role = has_role.role_name
  );
END;
$function$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN public.has_role(user_id, 'admin'::user_role_type);
END;
$function$;

-- 4. ADD MISSING RLS POLICIES FOR CRITICAL TABLES
-- ============================================================

-- Ensure all critical tables have proper RLS policies
-- (Only add if they don't already exist)

-- User activity log - critical for admin access tracking
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Users can view their own activity'
  ) THEN
    CREATE POLICY "Users can view their own activity" ON public.user_activity_log
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_activity_log' AND policyname = 'Users can insert their own activity'
  ) THEN
    CREATE POLICY "Users can insert their own activity" ON public.user_activity_log
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- User roles - critical for permission system
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can manage user roles'
  ) THEN
    CREATE POLICY "Admins can manage user roles" ON public.user_roles
      FOR ALL USING (public.is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles'
  ) THEN
    CREATE POLICY "Users can view their own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

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
AS $function$
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
$function$;

-- 6. LOG SECURITY FIXES
-- ============================================================

-- Create a security log entry
DO $$ BEGIN
  -- Insert security audit log
  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_type,
    details
  ) VALUES (
    auth.uid(),
    'security_hardening',
    'database',
    jsonb_build_object(
      'description', 'Critical security fixes applied for production readiness',
      'fixes', jsonb_build_array(
        'Enabled RLS on all user tables',
        'Fixed function search paths',
        'Added security helper functions',
        'Created security audit capabilities'
      ),
      'timestamp', now()
    )
  );
EXCEPTION WHEN OTHERS THEN
  -- If admin_actions table doesn't exist or there's no auth, continue silently
  NULL;
END $$;