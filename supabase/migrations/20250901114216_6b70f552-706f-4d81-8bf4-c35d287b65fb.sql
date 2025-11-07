-- Create full-text search indexes for facts
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add search indexes to facts table
CREATE INDEX IF NOT EXISTS facts_title_gin_idx ON facts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS facts_description_gin_idx ON facts USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS facts_location_gin_idx ON facts USING gin(to_tsvector('english', location_name));
CREATE INDEX IF NOT EXISTS facts_title_trgm_idx ON facts USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS facts_description_trgm_idx ON facts USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS facts_location_trgm_idx ON facts USING gin(location_name gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS facts_status_created_idx ON facts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS facts_category_created_idx ON facts (category_id, created_at DESC);
CREATE INDEX IF NOT EXISTS facts_location_point_idx ON facts USING gist(ST_Point(longitude, latitude));

-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  notification_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trending facts table
CREATE TABLE IF NOT EXISTS trending_facts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT trending_facts_fact_period_unique UNIQUE (fact_id, period_start)
);

-- Trending locations table
CREATE TABLE IF NOT EXISTS trending_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  fact_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  score NUMERIC NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT trending_locations_name_period_unique UNIQUE (location_name, period_start)
);

-- Remove duplicate trending fact entries prior to adding unique constraints
WITH fact_duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY fact_id, period_start ORDER BY created_at DESC, id DESC) AS rn
  FROM trending_facts
)
DELETE FROM trending_facts tf
USING fact_duplicates fd
WHERE tf.id = fd.id
  AND fd.rn > 1;

-- Remove duplicate trending location entries prior to adding unique constraints
WITH location_duplicates AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY location_name, period_start ORDER BY created_at DESC, id DESC) AS rn
  FROM trending_locations
)
DELETE FROM trending_locations tl
USING location_duplicates ld
WHERE tl.id = ld.id
  AND ld.rn > 1;

-- Ensure unique constraints exist if tables were created previously without them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'trending_facts_fact_period_unique'
      AND conrelid = 'public.trending_facts'::regclass
  ) THEN
    ALTER TABLE trending_facts
    ADD CONSTRAINT trending_facts_fact_period_unique UNIQUE (fact_id, period_start);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'trending_locations_name_period_unique'
      AND conrelid = 'public.trending_locations'::regclass
  ) THEN
    ALTER TABLE trending_locations
    ADD CONSTRAINT trending_locations_name_period_unique UNIQUE (location_name, period_start);
  END IF;
END $$;

-- User recommendations table
CREATE TABLE IF NOT EXISTS user_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fact_id UUID NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- QR codes table for location sharing
CREATE TABLE IF NOT EXISTS location_qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  location_name TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  created_by UUID,
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '30 days')
);

-- Add indexes for performance
CREATE INDEX search_history_user_created_idx ON search_history (user_id, created_at DESC);
CREATE INDEX search_history_query_idx ON search_history USING gin(query gin_trgm_ops);
CREATE INDEX saved_searches_user_idx ON saved_searches (user_id);
CREATE INDEX trending_facts_score_idx ON trending_facts (score DESC, period_start);
CREATE INDEX trending_locations_score_idx ON trending_locations (score DESC, period_start);
CREATE INDEX user_recommendations_user_score_idx ON user_recommendations (user_id, score DESC);
CREATE INDEX location_qr_codes_code_idx ON location_qr_codes (code);

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_qr_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for search_history
CREATE POLICY "Users can view their own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for saved_searches
CREATE POLICY "Users can manage their own saved searches" ON saved_searches
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for trending_facts
CREATE POLICY "Everyone can view trending facts" ON trending_facts
  FOR SELECT USING (true);

-- RLS Policies for trending_locations
CREATE POLICY "Everyone can view trending locations" ON trending_locations
  FOR SELECT USING (true);

-- RLS Policies for user_recommendations
CREATE POLICY "Users can view their own recommendations" ON user_recommendations
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for location_qr_codes
CREATE POLICY "Everyone can view QR codes" ON location_qr_codes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create QR codes" ON location_qr_codes
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Function to update trending scores
CREATE OR REPLACE FUNCTION update_trending_scores()
RETURNS void AS $$
BEGIN
  -- Update trending facts for the last 24 hours
  INSERT INTO trending_facts (fact_id, score, view_count, vote_count, comment_count, period_start, period_end)
  SELECT
    f.id,
    (COALESCE(f.vote_count_up, 0) * 3 + COALESCE(comment_count, 0) * 2 + 1) *
    EXTRACT(EPOCH FROM (now() - f.created_at)) / 86400 as score,
    1 as view_count,
    (COALESCE(f.vote_count_up, 0) + COALESCE(f.vote_count_down, 0)) as vote_count,
    (SELECT COUNT(*) FROM fact_comments WHERE fact_id = f.id) as comment_count,
    date_trunc('hour', now()) as period_start,
    date_trunc('hour', now()) + INTERVAL '1 hour' as period_end
  FROM facts f
  WHERE f.created_at >= now() - INTERVAL '24 hours'
    AND f.status = 'verified'
  ON CONFLICT (fact_id, period_start) DO UPDATE SET
    score = EXCLUDED.score,
    view_count = EXCLUDED.view_count,
    vote_count = EXCLUDED.vote_count,
    comment_count = EXCLUDED.comment_count,
    period_end = EXCLUDED.period_end;

  -- Update trending locations
  INSERT INTO trending_locations (location_name, latitude, longitude, fact_count, score, period_start, period_end)
  SELECT
    location_name,
    latitude,
    longitude,
    COUNT(*) as fact_count,
    COUNT(*) * 2 + SUM(vote_count_up) as score,
    date_trunc('hour', now()) as period_start,
    date_trunc('hour', now()) + INTERVAL '1 hour' as period_end
  FROM facts
  WHERE created_at >= now() - INTERVAL '24 hours'
    AND status = 'verified'
  GROUP BY location_name, latitude, longitude
  HAVING COUNT(*) > 1
  ON CONFLICT (location_name, period_start) DO UPDATE SET
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    fact_count = EXCLUDED.fact_count,
    score = EXCLUDED.score,
    period_end = EXCLUDED.period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate recommendations
CREATE OR REPLACE FUNCTION generate_user_recommendations(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Clear old recommendations
  DELETE FROM user_recommendations 
  WHERE user_id = target_user_id AND expires_at < now();

  -- Generate recommendations based on user activity
  INSERT INTO user_recommendations (user_id, fact_id, score, reason)
  SELECT 
    target_user_id,
    f.id,
    (f.vote_count_up * 2 + 
     (SELECT COUNT(*) FROM fact_comments WHERE fact_id = f.id) +
     CASE WHEN f.category_id IN (
       SELECT DISTINCT category_id FROM facts 
       WHERE author_id = target_user_id
     ) THEN 10 ELSE 0 END) as score,
    CASE 
      WHEN f.category_id IN (
        SELECT DISTINCT category_id FROM facts 
        WHERE author_id = target_user_id
      ) THEN 'Similar to your interests'
      ELSE 'Trending in your area'
    END as reason
  FROM facts f
  WHERE f.status = 'verified'
    AND f.author_id != target_user_id
    AND f.id NOT IN (
      SELECT fact_id FROM votes WHERE user_id = target_user_id
    )
    AND f.id NOT IN (
      SELECT fact_id FROM user_recommendations 
      WHERE user_id = target_user_id AND expires_at > now()
    )
  ORDER BY score DESC
  LIMIT 20
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;