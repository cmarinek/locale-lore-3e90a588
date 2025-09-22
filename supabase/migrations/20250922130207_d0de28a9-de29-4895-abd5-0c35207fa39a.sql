-- Drop existing get_fact_clusters functions
DROP FUNCTION IF EXISTS public.get_fact_clusters(double precision, double precision, double precision, double precision, integer, double precision);
DROP FUNCTION IF EXISTS public.get_fact_clusters(double precision, double precision, double precision, double precision, integer);

-- Create the corrected clustering function
CREATE OR REPLACE FUNCTION public.get_fact_clusters(
  p_north DOUBLE PRECISION,
  p_south DOUBLE PRECISION,
  p_east DOUBLE PRECISION,
  p_west DOUBLE PRECISION,
  p_zoom INTEGER DEFAULT 10
) RETURNS TABLE (
  cluster_id TEXT,
  cluster_latitude DOUBLE PRECISION,
  cluster_longitude DOUBLE PRECISION,
  cluster_count INTEGER,
  cluster_bounds JSONB
) AS $$
DECLARE
  grid_size DOUBLE PRECISION;
BEGIN
  -- Calculate grid size based on zoom level (smaller grid = more clusters)
  grid_size := CASE 
    WHEN p_zoom <= 8 THEN 1.0    -- Large grid for very low zoom
    WHEN p_zoom <= 10 THEN 0.5   -- Medium grid for low zoom  
    WHEN p_zoom <= 12 THEN 0.25  -- Small grid for medium zoom
    ELSE 0.1                     -- Very small grid for high zoom
  END;

  RETURN QUERY
  WITH clustered_facts AS (
    SELECT 
      FLOOR(CAST(latitude AS DOUBLE PRECISION) / grid_size) * grid_size + grid_size/2 as cluster_lat,
      FLOOR(CAST(longitude AS DOUBLE PRECISION) / grid_size) * grid_size + grid_size/2 as cluster_lng,
      COUNT(*) as fact_count,
      MIN(CAST(latitude AS DOUBLE PRECISION)) as min_lat,
      MAX(CAST(latitude AS DOUBLE PRECISION)) as max_lat,
      MIN(CAST(longitude AS DOUBLE PRECISION)) as min_lng,
      MAX(CAST(longitude AS DOUBLE PRECISION)) as max_lng
    FROM facts
    WHERE 
      CAST(latitude AS DOUBLE PRECISION) BETWEEN p_south AND p_north
      AND CAST(longitude AS DOUBLE PRECISION) BETWEEN p_west AND p_east
      AND status = 'verified'
    GROUP BY 
      FLOOR(CAST(latitude AS DOUBLE PRECISION) / grid_size),
      FLOOR(CAST(longitude AS DOUBLE PRECISION) / grid_size)
    HAVING COUNT(*) >= 1  -- Include all facts, even single ones
  )
  SELECT 
    cluster_lat::TEXT || ',' || cluster_lng::TEXT as cluster_id,
    cluster_lat as cluster_latitude,
    cluster_lng as cluster_longitude,
    fact_count::INTEGER as cluster_count,
    jsonb_build_object(
      'north', max_lat,
      'south', min_lat,
      'east', max_lng,
      'west', min_lng
    ) as cluster_bounds
  FROM clustered_facts
  ORDER BY fact_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';