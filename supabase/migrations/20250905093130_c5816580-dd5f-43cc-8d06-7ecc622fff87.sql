-- Enable RLS on spatial_ref_sys table
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to read spatial reference systems
-- This is safe as this table contains standard spatial reference system definitions
CREATE POLICY "Allow public read access to spatial reference systems" 
ON public.spatial_ref_sys 
FOR SELECT 
USING (true);

-- Only allow admins to modify spatial reference systems (if needed)
CREATE POLICY "Only admins can modify spatial reference systems" 
ON public.spatial_ref_sys 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'admin'
  )
);