-- Fix security issues by setting proper search paths for functions and enabling RLS on missing tables

-- Fix search paths for all functions
ALTER FUNCTION update_follow_counts() SET search_path = public;
ALTER FUNCTION create_activity_feed_entry() SET search_path = public;

-- Enable RLS on PostGIS tables that need it
ALTER TABLE geometry_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE geography_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policies for PostGIS tables to allow public read access
CREATE POLICY "Allow public read access" ON geometry_columns FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON geography_columns FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON spatial_ref_sys FOR SELECT USING (true);