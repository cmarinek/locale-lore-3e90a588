-- Fix the get_fact_clusters function to include pending facts and improve parameter order
CREATE OR REPLACE FUNCTION public.get_fact_clusters(
  p_north double precision, 
  p_south double precision, 
  p_east double precision, 
  p_west double precision, 
  p_zoom integer DEFAULT 10
)
RETURNS TABLE(
  cluster_id text, 
  cluster_latitude double precision, 
  cluster_longitude double precision, 
  cluster_count integer, 
  cluster_bounds jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  grid_size DOUBLE PRECISION;
BEGIN
  -- Calculate grid size based on zoom level with better progression
  grid_size := CASE 
    WHEN p_zoom <= 6 THEN 2.0     -- Very large grid for world view
    WHEN p_zoom <= 8 THEN 1.0     -- Large grid for continent view
    WHEN p_zoom <= 10 THEN 0.5    -- Medium grid for country view  
    WHEN p_zoom <= 12 THEN 0.25   -- Small grid for region view
    WHEN p_zoom <= 14 THEN 0.1    -- Very small grid for city view
    ELSE 0.05                     -- Tiny grid for street view
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
      AND status IN ('verified', 'pending')  -- Include both verified and pending facts
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
    GROUP BY 
      FLOOR(CAST(latitude AS DOUBLE PRECISION) / grid_size),
      FLOOR(CAST(longitude AS DOUBLE PRECISION) / grid_size)
    HAVING COUNT(*) >= 1
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
$function$;