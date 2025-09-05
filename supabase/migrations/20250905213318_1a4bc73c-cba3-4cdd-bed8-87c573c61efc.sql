-- Security Fix: Enable RLS on PostGIS system tables with appropriate policies
-- This addresses the "RLS Disabled in Public" security finding

-- Enable RLS on spatial_ref_sys table (PostGIS system table)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to spatial reference systems for everyone
-- This is safe because spatial_ref_sys contains standard coordinate system definitions
CREATE POLICY "Allow read access to spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
USING (true);

-- Only allow admins to modify spatial reference systems (rarely needed)
CREATE POLICY "Only admins can modify spatial reference systems" 
ON public.spatial_ref_sys 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role_type));

-- Check if geometry_columns table exists and enable RLS if it does
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'geometry_columns') THEN
        ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow read access to geometry columns" 
        ON public.geometry_columns 
        FOR SELECT 
        USING (true);
        
        CREATE POLICY "Only admins can modify geometry columns" 
        ON public.geometry_columns 
        FOR ALL 
        USING (has_role(auth.uid(), 'admin'::user_role_type));
    END IF;
END $$;

-- Check if geography_columns table exists and enable RLS if it does
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'geography_columns') THEN
        ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow read access to geography columns" 
        ON public.geography_columns 
        FOR SELECT 
        USING (true);
        
        CREATE POLICY "Only admins can modify geography columns" 
        ON public.geography_columns 
        FOR ALL 
        USING (has_role(auth.uid(), 'admin'::user_role_type));
    END IF;
END $$;