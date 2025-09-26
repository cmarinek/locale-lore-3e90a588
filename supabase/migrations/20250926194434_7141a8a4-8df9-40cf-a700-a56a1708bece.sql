-- 1. CREATE SPATIAL INDEX for geographic queries using standard PostGIS
CREATE INDEX IF NOT EXISTS idx_facts_geography 
ON facts USING gist(ST_Point(CAST(longitude AS double precision), CAST(latitude AS double precision)));

-- 2. CREATE COMPOSITE INDEXES for common query patterns
CREATE INDEX IF NOT EXISTS idx_facts_status_geography 
ON facts (status, latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_facts_category_geography 
ON facts (category_id, latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. CREATE PERFORMANCE INDEX for vote-based ordering
CREATE INDEX IF NOT EXISTS idx_facts_votes_desc 
ON facts (vote_count_up DESC, created_at DESC) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 4. OPTIMIZE CATEGORY JOINS
CREATE INDEX IF NOT EXISTS idx_facts_category_id ON facts (category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);

-- 5. CREATE PARTIAL INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_facts_verified_recent
ON facts (created_at DESC)
WHERE status = 'verified' AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- 6. CREATE BTREE INDEXES for geographic bounds queries
CREATE INDEX IF NOT EXISTS idx_facts_latitude ON facts (latitude) 
WHERE latitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_facts_longitude ON facts (longitude) 
WHERE longitude IS NOT NULL;

-- 7. ENABLE GEOGRAPHIC STATISTICS (helps query planner)
ANALYZE facts;