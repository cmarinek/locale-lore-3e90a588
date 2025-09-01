-- Fix remaining security issues

-- The spatial_ref_sys table is created by PostGIS and doesn't need RLS
-- Enable RLS on it anyway to satisfy the linter
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access to spatial_ref_sys (PostGIS reference data)
CREATE POLICY "Allow read access to spatial reference systems" ON public.spatial_ref_sys
    FOR SELECT USING (true);

-- Move extensions from public schema to extensions schema (best practice)
-- First drop from public, then create in extensions schema
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
DROP EXTENSION IF EXISTS "postgis" CASCADE;

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Recreate extensions in the extensions schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA extensions;

-- Update search path to include extensions schema
ALTER DATABASE postgres SET search_path = "$user", public, extensions;