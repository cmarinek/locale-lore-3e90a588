-- Create a function to check RLS status for security monitoring
CREATE OR REPLACE FUNCTION public.check_rls_status()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  is_system_table boolean
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    t.rowsecurity,
    CASE 
      WHEN t.tablename IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns') 
      THEN true 
      ELSE false 
    END as is_system_table
  FROM pg_tables t
  WHERE t.schemaname = 'public'
  ORDER BY t.tablename;
END;
$$;

-- Grant execute permission to authenticated users for monitoring
GRANT EXECUTE ON FUNCTION public.check_rls_status() TO authenticated;