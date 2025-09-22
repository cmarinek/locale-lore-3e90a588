-- Update the get_fact_clusters function for progressive clustering
CREATE OR REPLACE FUNCTION public.get_fact_clusters(p_north double precision, p_south double precision, p_east double precision, p_west double precision, p_zoom integer DEFAULT 10)
 RETURNS TABLE(cluster_id text, cluster_latitude double precision, cluster_longitude double precision, cluster_count integer, cluster_bounds jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  grid_size DOUBLE PRECISION;
  min_cluster_size INTEGER;
BEGIN
  -- Calculate progressive grid size based on zoom level
  -- More granular progression for smoother transitions
  grid_size := CASE 
    WHEN p_zoom <= 4 THEN 5.0      -- Continental view
    WHEN p_zoom <= 6 THEN 2.0      -- Large country view
    WHEN p_zoom <= 8 THEN 1.0      -- Country view
    WHEN p_zoom <= 10 THEN 0.5     -- Region view
    WHEN p_zoom <= 12 THEN 0.25    -- State/province view
    WHEN p_zoom <= 14 THEN 0.1     -- City view
    WHEN p_zoom <= 16 THEN 0.05    -- District view
    ELSE 0.02                      -- Street view
  END;

  -- Set minimum cluster size - smaller clusters at higher zoom levels
  min_cluster_size := CASE 
    WHEN p_zoom >= 16 THEN 1       -- Show individual facts at street level
    WHEN p_zoom >= 14 THEN 2       -- Small clusters at city level
    WHEN p_zoom >= 12 THEN 3       -- Medium clusters at state level
    ELSE 5                         -- Larger clusters at regional+ level
  END;

  -- Log the grid size for debugging
  RAISE LOG 'get_fact_clusters: zoom=%, grid_size=%, min_cluster_size=%', p_zoom, grid_size, min_cluster_size;

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
      AND status IN ('verified', 'pending')
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
    GROUP BY 
      FLOOR(CAST(latitude AS DOUBLE PRECISION) / grid_size),
      FLOOR(CAST(longitude AS DOUBLE PRECISION) / grid_size)
    HAVING COUNT(*) >= min_cluster_size
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
$function$