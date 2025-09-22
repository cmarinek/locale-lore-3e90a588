-- Optimize spatial indexing for millions of points
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_facts_geolocation_gist 
ON public.facts USING GIST (geolocation);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_facts_location_coords 
ON public.facts (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add spatial clustering optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_facts_status_location 
ON public.facts (status, latitude, longitude) 
WHERE status IN ('verified', 'pending');

-- Optimize fact clustering function for better performance
CREATE OR REPLACE FUNCTION public.get_optimized_fact_clusters(
  p_north double precision, 
  p_south double precision, 
  p_east double precision, 
  p_west double precision, 
  p_zoom integer DEFAULT 10,
  p_limit integer DEFAULT 1000
)
RETURNS TABLE(
  cluster_id text, 
  cluster_latitude double precision, 
  cluster_longitude double precision, 
  cluster_count integer, 
  cluster_bounds jsonb,
  sample_facts jsonb
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  grid_size DOUBLE PRECISION;
  min_cluster_size INTEGER;
  longitude_condition TEXT;
BEGIN
  -- Progressive grid size based on zoom level
  grid_size := CASE 
    WHEN p_zoom <= 2 THEN 10.0
    WHEN p_zoom <= 4 THEN 5.0
    WHEN p_zoom <= 6 THEN 2.0
    WHEN p_zoom <= 8 THEN 1.0
    WHEN p_zoom <= 10 THEN 0.5
    WHEN p_zoom <= 12 THEN 0.25
    WHEN p_zoom <= 14 THEN 0.1
    ELSE 0.05
  END;

  min_cluster_size := CASE 
    WHEN p_zoom >= 14 THEN 1
    WHEN p_zoom >= 12 THEN 2
    WHEN p_zoom >= 10 THEN 3
    ELSE 5
  END;

  -- Handle longitude bounds crossing international date line
  IF p_west > p_east THEN
    longitude_condition := 'OR (CAST(longitude AS DOUBLE PRECISION) >= ' || p_west || ' OR CAST(longitude AS DOUBLE PRECISION) <= ' || p_east || ')';
  ELSE
    longitude_condition := 'AND CAST(longitude AS DOUBLE PRECISION) BETWEEN ' || p_west || ' AND ' || p_east;
  END IF;

  RETURN QUERY
  EXECUTE format('
    WITH clustered_facts AS (
      SELECT 
        FLOOR(CAST(latitude AS DOUBLE PRECISION) / %s) * %s + %s/2 as cluster_lat,
        FLOOR(CAST(longitude AS DOUBLE PRECISION) / %s) * %s + %s/2 as cluster_lng,
        COUNT(*) as fact_count,
        MIN(CAST(latitude AS DOUBLE PRECISION)) as min_lat,
        MAX(CAST(latitude AS DOUBLE PRECISION)) as max_lat,
        MIN(CAST(longitude AS DOUBLE PRECISION)) as min_lng,
        MAX(CAST(longitude AS DOUBLE PRECISION)) as max_lng,
        jsonb_agg(
          jsonb_build_object(
            ''id'', id,
            ''title'', title,
            ''location_name'', location_name
          ) ORDER BY created_at DESC LIMIT 3
        ) as sample_facts
      FROM facts
      WHERE 
        CAST(latitude AS DOUBLE PRECISION) BETWEEN %s AND %s
        %s
        AND status IN (''verified'', ''pending'')
        AND latitude IS NOT NULL 
        AND longitude IS NOT NULL
      GROUP BY 
        FLOOR(CAST(latitude AS DOUBLE PRECISION) / %s),
        FLOOR(CAST(longitude AS DOUBLE PRECISION) / %s)
      HAVING COUNT(*) >= %s
      ORDER BY fact_count DESC
      LIMIT %s
    )
    SELECT 
      cluster_lat::TEXT || '','' || cluster_lng::TEXT as cluster_id,
      cluster_lat as cluster_latitude,
      cluster_lng as cluster_longitude,
      fact_count::INTEGER as cluster_count,
      jsonb_build_object(
        ''north'', max_lat,
        ''south'', min_lat,
        ''east'', max_lng,
        ''west'', min_lng
      ) as cluster_bounds,
      sample_facts
    FROM clustered_facts',
    grid_size, grid_size, grid_size,
    grid_size, grid_size, grid_size,
    p_south, p_north,
    longitude_condition,
    grid_size, grid_size,
    min_cluster_size,
    p_limit
  );
END;
$function$;