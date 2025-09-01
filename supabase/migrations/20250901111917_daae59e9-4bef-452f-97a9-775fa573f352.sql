-- Fix RLS disabled tables
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geometry_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geography_columns ENABLE ROW LEVEL SECURITY;

-- Add permissive policies for these system tables
CREATE POLICY "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys FOR SELECT USING (true);
CREATE POLICY "Allow read access to geometry_columns" ON public.geometry_columns FOR SELECT USING (true);
CREATE POLICY "Allow read access to geography_columns" ON public.geography_columns FOR SELECT USING (true);

-- Fix function search path issues
CREATE OR REPLACE FUNCTION public.update_lore_submissions_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;