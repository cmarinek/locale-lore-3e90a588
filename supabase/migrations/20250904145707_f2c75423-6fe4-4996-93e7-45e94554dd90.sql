-- CRITICAL SECURITY FIX: Enable RLS on missing tables and secure remaining functions

-- First, let's identify and enable RLS on any tables that don't have it
DO $$
DECLARE
    table_record record;
BEGIN
    -- Find tables without RLS enabled that should have it
    FOR table_record IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        LEFT JOIN pg_class c ON c.relname = t.table_name
        LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND n.nspname = 'public'
        AND NOT c.relrowsecurity
        AND t.table_name NOT LIKE 'pg_%'
        AND t.table_name NOT LIKE 'spatial_%'
        AND t.table_name NOT IN ('schema_migrations', 'supabase_migrations', 'geography_columns', 'geometry_columns', 'spatial_ref_sys')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.table_name);
        RAISE NOTICE 'Enabled RLS on table: %', table_record.table_name;
    END LOOP;
END $$;

-- Fix search_path for ANY remaining functions that don't have it set
DO $$
DECLARE
    func_record record;
BEGIN
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prolang != (SELECT oid FROM pg_language WHERE lanname = 'c') -- Exclude C functions (PostGIS)
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config pc 
            WHERE pc.prooid = p.oid 
            AND pc.proconfig[1] LIKE 'search_path=%'
        )
    LOOP
        -- Add SET search_path = public to each function that doesn't have it
        BEGIN
            EXECUTE format(
                'ALTER FUNCTION public.%I(%s) SET search_path = public',
                func_record.function_name,
                func_record.args
            );
            RAISE NOTICE 'Fixed search_path for function: %', func_record.function_name;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not fix search_path for function: % (Error: %)', func_record.function_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Create missing RLS policies for any tables that might need them
-- Let's check user_challenge_progress if it exists and needs policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_challenge_progress' AND table_schema = 'public') THEN
        -- Add RLS policies for user_challenge_progress if they don't exist
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_challenge_progress' AND policyname = 'Users can view their own progress') THEN
            CREATE POLICY "Users can view their own progress" 
            ON public.user_challenge_progress 
            FOR SELECT 
            USING (auth.uid() = user_id);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_challenge_progress' AND policyname = 'Users can update their own progress') THEN
            CREATE POLICY "Users can update their own progress" 
            ON public.user_challenge_progress 
            FOR ALL 
            USING (auth.uid() = user_id);
        END IF;
        
        RAISE NOTICE 'Added RLS policies for user_challenge_progress';
    END IF;
END $$;

-- Create has_role function if it doesn't exist (needed for admin policies)
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name user_role_type)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = $1 AND user_roles.role = $2
  );
END;
$$;