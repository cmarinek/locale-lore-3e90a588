/**
 * Database optimization guide for scaling to millions of facts
 * 
 * Run these SQL commands in your Supabase SQL editor to optimize for scale:
 */

-- 1. CREATE SPATIAL INDEX for geographic queries (CRITICAL for performance)
CREATE INDEX IF NOT EXISTS idx_facts_geography 
ON facts USING gist(ll_to_earth(latitude, longitude));

-- Alternative spatial index using PostGIS (if available)
-- CREATE INDEX IF NOT EXISTS idx_facts_location_gist 
-- ON facts USING gist(st_point(longitude, latitude));

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

-- 5. ENABLE GEOGRAPHIC STATISTICS (helps query planner)
ANALYZE facts;

-- 6. CREATE MATERIALIZED VIEW for fact counts by region (optional but helpful)
CREATE MATERIALIZED VIEW IF NOT EXISTS fact_counts_by_region AS
SELECT 
  FLOOR(latitude * 10) / 10 AS lat_region,
  FLOOR(longitude * 10) / 10 AS lng_region,
  COUNT(*) AS fact_count,
  COUNT(*) FILTER (WHERE status = 'verified') AS verified_count
FROM facts 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL
GROUP BY lat_region, lng_region;

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW fact_counts_by_region;

-- 7. ENABLE ROW LEVEL SECURITY (if not already enabled)
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;

-- 8. OPTIMIZE POSTGRESQL SETTINGS (for your database admin)
/*
-- These should be set in your postgresql.conf:
shared_buffers = 256MB  -- Or 25% of available RAM
work_mem = 4MB
maintenance_work_mem = 64MB
effective_cache_size = 1GB  -- Or 75% of available RAM
random_page_cost = 1.1
checkpoint_completion_target = 0.9
max_connections = 100  -- Adjust based on your needs
*/

-- 9. CREATE PARTIAL INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_facts_verified_recent
ON facts (created_at DESC)
WHERE status = 'verified' AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- 10. CLUSTERING TABLE for better disk locality (run periodically)
-- CLUSTER facts USING idx_facts_geography;

-- 11. SET UP AUTOMATIC VACUUM for maintenance
-- ALTER TABLE facts SET (autovacuum_vacuum_scale_factor = 0.05);
-- ALTER TABLE facts SET (autovacuum_analyze_scale_factor = 0.05);

/*
PERFORMANCE EXPECTATIONS AFTER OPTIMIZATION:

With proper indexing:
- Geographic queries: < 50ms for viewport with 1M+ facts
- Category filtering: < 100ms 
- Zoom-based queries: < 200ms
- Count aggregations: < 500ms

WITHOUT these indexes:
- Geographic queries: 5-30 seconds (unusable)
- Category filtering: 10+ seconds
- Large viewport queries: Timeout

MONITORING QUERIES:

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'facts';

-- Check query performance  
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements 
WHERE query LIKE '%facts%'
ORDER BY total_time DESC;

-- Check index size
SELECT 
  schemaname, tablename, indexname, 
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes 
WHERE tablename = 'facts';
*/