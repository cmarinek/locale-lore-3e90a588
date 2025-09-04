-- Fix only custom functions by adding search_path
-- We'll only update functions that we actually own (not PostGIS functions)

-- First, let's check what tables exist and enable RLS only on user tables
DO $$
DECLARE
    table_name text;
BEGIN
    -- Get only user-created tables that don't have RLS enabled
    -- Exclude PostGIS and system tables
    FOR table_name IN 
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
        AND t.table_name NOT IN ('schema_migrations', 'supabase_migrations', 'geography_columns', 'geometry_columns')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        RAISE NOTICE 'Enabled RLS on table: %', table_name;
    END LOOP;
END $$;

-- Fix search_path only for our custom functions (not PostGIS functions)
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
        AND p.proname IN ('update_story_counts', 'cleanup_expired_stories', 'update_trending_stories', 'has_role')
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config pc 
            WHERE pc.prooid = p.oid 
            AND pc.proconfig[1] LIKE 'search_path=%'
        )
    LOOP
        -- Add SET search_path = public to each function
        EXECUTE format(
            'ALTER FUNCTION public.%I(%s) SET search_path = public',
            func_record.function_name,
            func_record.args
        );
        RAISE NOTICE 'Fixed search_path for function: %', func_record.function_name;
    END LOOP;
END $$;