-- Phase 3: Security Hardening Migration
-- Fix database function security issues

-- 1. Fix update_updated_at_column function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Fix has_role function with explicit search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- 3. Drop and recreate check_rls_status with explicit search_path
DROP FUNCTION IF EXISTS public.check_rls_status();

CREATE FUNCTION public.check_rls_status()
RETURNS TABLE (
  table_name text,
  rls_enabled boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tablename::text,
    rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
  ORDER BY tablename;
$$;

-- 4. Enable RLS on all user tables (except documented PostGIS exceptions)
DO $$
DECLARE
  r RECORD;
  tables_without_rls INTEGER := 0;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT IN ('spatial_ref_sys', 'geography_columns', 'geometry_columns')
    AND rowsecurity = false
  LOOP
    RAISE NOTICE 'Enabling RLS on table: %', r.tablename;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    tables_without_rls := tables_without_rls + 1;
  END LOOP;
  
  IF tables_without_rls = 0 THEN
    RAISE NOTICE 'All user tables already have RLS enabled';
  ELSE
    RAISE NOTICE 'Enabled RLS on % tables', tables_without_rls;
  END IF;
END $$;

-- 5. Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  table_name text,
  user_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Only admins can view security audit log" ON public.security_audit_log;
DROP POLICY IF EXISTS "System can insert security audit log" ON public.security_audit_log;

CREATE POLICY "Only admins can view security audit log"
  ON public.security_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert security audit log"
  ON public.security_audit_log
  FOR INSERT
  WITH CHECK (true);