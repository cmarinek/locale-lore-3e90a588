-- Create clustering function for scalable map performance
-- This function will be used to efficiently cluster facts based on viewport and zoom level

CREATE OR REPLACE FUNCTION get_fact_clusters(
  p_north FLOAT,
  p_south FLOAT, 
  p_east FLOAT,
  p_west FLOAT,
  p_zoom INTEGER,
  p_radius FLOAT DEFAULT 50
)
RETURNS TABLE (
  id TEXT,
  center FLOAT[],
  count INTEGER,
  verified_count INTEGER,
  total_votes INTEGER,
  bounds JSONB,
  zoom_level INTEGER
) AS $$
DECLARE
  grid_size FLOAT;
BEGIN
  -- Calculate grid size based on zoom level
  grid_size := CASE 
    WHEN p_zoom <= 5 THEN 10.0
    WHEN p_zoom <= 8 THEN 5.0
    WHEN p_zoom <= 10 THEN 2.0
    WHEN p_zoom <= 12 THEN 1.0
    ELSE 0.5
  END;

  RETURN QUERY
  WITH fact_grid AS (
    SELECT 
      f.id,
      f.latitude,
      f.longitude,
      f.status,
      f.vote_count_up,
      f.vote_count_down,
      FLOOR(f.latitude / grid_size) * grid_size AS grid_lat,
      FLOOR(f.longitude / grid_size) * grid_size AS grid_lng
    FROM facts f
    WHERE 
      f.latitude BETWEEN p_south AND p_north
      AND f.longitude BETWEEN p_west AND p_east
      AND f.latitude IS NOT NULL
      AND f.longitude IS NOT NULL
      AND f.status IN ('verified', 'pending')
  ),
  clusters AS (
    SELECT 
      grid_lat || '_' || grid_lng AS cluster_id,
      ARRAY[grid_lng + grid_size/2, grid_lat + grid_size/2] AS cluster_center,
      COUNT(*)::INTEGER AS fact_count,
      COUNT(*) FILTER (WHERE status = 'verified')::INTEGER AS verified_facts,
      COALESCE(SUM(COALESCE(vote_count_up, 0) - COALESCE(vote_count_down, 0)), 0)::INTEGER AS vote_total,
      jsonb_build_object(
        'north', grid_lat + grid_size,
        'south', grid_lat,
        'east', grid_lng + grid_size,
        'west', grid_lng
      ) AS cluster_bounds
    FROM fact_grid
    GROUP BY grid_lat, grid_lng
    HAVING COUNT(*) > 1  -- Only return clusters with multiple facts
  )
  SELECT 
    cluster_id,
    cluster_center,
    fact_count,
    verified_facts,
    vote_total,
    cluster_bounds,
    p_zoom
  FROM clusters
  ORDER BY fact_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_fact_clusters TO authenticated;

-- Create index for better performance on geographic queries
CREATE INDEX IF NOT EXISTS idx_facts_location_status ON facts (latitude, longitude, status)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;