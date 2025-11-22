-- Create function to find facts within a radius
-- Uses PostGIS geography functions for accurate distance calculations

CREATE OR REPLACE FUNCTION facts_within_radius(
  lat DECIMAL,
  lng DECIMAL,
  radius_meters INTEGER,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  location_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  status TEXT,
  vote_count_up INTEGER,
  distance FLOAT,
  categories JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.location_name,
    f.latitude,
    f.longitude,
    f.status::TEXT,
    f.vote_count_up,
    ST_Distance(
      f.geolocation,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    )::FLOAT as distance,
    jsonb_build_object(
      'icon', c.icon,
      'slug', c.slug,
      'color', c.color
    ) as categories
  FROM facts f
  INNER JOIN categories c ON f.category_id = c.id
  WHERE
    f.status = 'verified'
    AND ST_DWithin(
      f.geolocation,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance ASC
  LIMIT max_results;
END;
$$;

-- Add comment
COMMENT ON FUNCTION facts_within_radius IS 'Find verified facts within a specified radius (meters) of a location, ordered by distance';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION facts_within_radius TO authenticated;
GRANT EXECUTE ON FUNCTION facts_within_radius TO anon;
