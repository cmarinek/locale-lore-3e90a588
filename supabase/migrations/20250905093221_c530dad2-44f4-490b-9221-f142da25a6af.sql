-- Enable RLS on the spatial_ref_sys table 
-- This is a PostGIS system table that contains spatial reference system definitions
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read from this table
-- since it contains standard reference data that should be publicly accessible
CREATE POLICY "spatial_ref_sys_read_policy" 
ON public.spatial_ref_sys 
FOR SELECT 
TO public
USING (true);

-- Restrict INSERT/UPDATE/DELETE operations to authenticated users only
-- Most applications should not modify this system table
CREATE POLICY "spatial_ref_sys_modify_policy" 
ON public.spatial_ref_sys 
FOR ALL 
TO authenticated
USING (false) 
WITH CHECK (false);