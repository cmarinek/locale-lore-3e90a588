-- Fix security issues by setting proper search paths for functions and enabling RLS on missing tables

-- Fix search paths for all functions
ALTER FUNCTION update_follow_counts() SET search_path = public;
ALTER FUNCTION create_activity_feed_entry() SET search_path = public;

-- Check and enable RLS on any missing tables - let's be comprehensive
DO $$
BEGIN
    -- Enable RLS on any tables that might be missing it
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geometry_columns') THEN
        ALTER TABLE geometry_columns ENABLE ROW LEVEL SECURITY;
        CREATE POLICY IF NOT EXISTS "Allow public read access" ON geometry_columns FOR SELECT USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'geography_columns') THEN
        ALTER TABLE geography_columns ENABLE ROW LEVEL SECURITY;
        CREATE POLICY IF NOT EXISTS "Allow public read access" ON geography_columns FOR SELECT USING (true);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'spatial_ref_sys') THEN
        ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;
        CREATE POLICY IF NOT EXISTS "Allow public read access" ON spatial_ref_sys FOR SELECT USING (true);
    END IF;
END
$$;