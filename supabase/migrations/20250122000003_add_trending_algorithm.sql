-- Add computed trending_score column and function for trending facts

-- Create function to calculate trending score
-- Formula: (recent_votes * 2 + views * 0.5) / (age_hours + 2)^1.8
-- Weights recent activity heavily, decays over time

CREATE OR REPLACE FUNCTION calculate_trending_score(
  fact_id UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  age_hours DECIMAL;
  recent_votes INTEGER;
  total_views INTEGER;
  trending_score DECIMAL;
BEGIN
  -- Get fact age in hours
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600
  INTO age_hours
  FROM facts
  WHERE id = fact_id;

  -- Get recent vote count (last 24 hours would require vote timestamps)
  -- For now, use total upvotes as approximation
  SELECT vote_count_up
  INTO recent_votes
  FROM facts
  WHERE id = fact_id;

  -- Get view count
  SELECT COALESCE(view_count, 0)
  INTO total_views
  FROM facts
  WHERE id = fact_id;

  -- Calculate trending score
  -- Higher score = more trending
  trending_score := (
    (recent_votes * 2.0) +
    (total_views * 0.5)
  ) / POWER(age_hours + 2, 1.8);

  RETURN trending_score;
END;
$$;

-- Create view for trending facts (refreshed periodically)
CREATE OR REPLACE VIEW trending_facts AS
SELECT
  f.*,
  calculate_trending_score(f.id) as trending_score
FROM facts f
WHERE
  f.status = 'verified'
  AND f.created_at > NOW() - INTERVAL '30 days'
ORDER BY trending_score DESC
LIMIT 100;

-- Create function to get trending facts
CREATE OR REPLACE FUNCTION get_trending_facts(
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  location_name TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  category_id UUID,
  status TEXT,
  vote_count_up INTEGER,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  trending_score DECIMAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.title,
    f.description,
    f.location_name,
    f.latitude,
    f.longitude,
    f.category_id,
    f.status::TEXT,
    f.vote_count_up,
    f.view_count,
    f.created_at,
    (
      (f.vote_count_up * 2.0) +
      (COALESCE(f.view_count, 0) * 0.5)
    ) / POWER((EXTRACT(EPOCH FROM (NOW() - f.created_at)) / 3600) + 2, 1.8) as trending_score
  FROM facts f
  WHERE
    f.status = 'verified'
    AND f.created_at > NOW() - INTERVAL '30 days'
  ORDER BY trending_score DESC
  LIMIT limit_count;
END;
$$;

-- Grant permissions
GRANT SELECT ON trending_facts TO authenticated;
GRANT SELECT ON trending_facts TO anon;
GRANT EXECUTE ON FUNCTION get_trending_facts TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_facts TO anon;
GRANT EXECUTE ON FUNCTION calculate_trending_score TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_trending_score TO anon;

-- Add comments
COMMENT ON FUNCTION calculate_trending_score IS 'Calculate trending score based on votes, views, and recency';
COMMENT ON FUNCTION get_trending_facts IS 'Get top trending facts from the last 30 days';
COMMENT ON VIEW trending_facts IS 'Materialized view of top 100 trending facts';
