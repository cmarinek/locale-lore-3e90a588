-- Fix RLS on missing tables
-- Enable RLS on any tables that don't have it
DO $$
DECLARE
    table_name text;
    schema_name text := 'public';
BEGIN
    -- Get all tables in public schema that don't have RLS enabled
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        LEFT JOIN pg_class c ON c.relname = t.table_name
        LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE t.table_schema = schema_name 
        AND t.table_type = 'BASE TABLE'
        AND n.nspname = schema_name
        AND NOT c.relrowsecurity
        AND t.table_name NOT LIKE 'pg_%'
        AND t.table_name NOT IN ('schema_migrations', 'supabase_migrations')
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', schema_name, table_name);
        RAISE NOTICE 'Enabled RLS on table: %', table_name;
    END LOOP;
END $$;

-- Fix function search paths for all functions without SET search_path
DO $$
DECLARE
    func_record record;
BEGIN
    FOR func_record IN 
        SELECT 
            p.proname as function_name,
            n.nspname as schema_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname NOT LIKE 'pg_%'
        AND NOT EXISTS (
            SELECT 1 FROM pg_proc_config pc 
            WHERE pc.prooid = p.oid 
            AND pc.proconfig[1] LIKE 'search_path=%'
        )
    LOOP
        -- Add SET search_path = public to each function
        EXECUTE format(
            'ALTER FUNCTION %I.%I(%s) SET search_path = public',
            func_record.schema_name,
            func_record.function_name,
            func_record.args
        );
        RAISE NOTICE 'Fixed search_path for function: %', func_record.function_name;
    END LOOP;
END $$;