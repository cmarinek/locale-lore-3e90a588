-- Update get_fact_clusters function for seamless zoom transitions
CREATE OR REPLACE FUNCTION get_fact_clusters(
    p_north DECIMAL,
    p_south DECIMAL,
    p_east DECIMAL,
    p_west DECIMAL,
    p_zoom INTEGER
)
RETURNS TABLE(
    cluster_id TEXT,
    cluster_latitude DECIMAL,
    cluster_longitude DECIMAL,
    cluster_count INTEGER,
    cluster_bounds TEXT
) AS $$
DECLARE
    grid_size DECIMAL;
    min_cluster_size INTEGER;
BEGIN
    -- Calculate grid size based on zoom level for progressive clustering
    -- Higher zoom = smaller grid = more granular clusters
    grid_size := CASE 
        WHEN p_zoom <= 6 THEN 2.0    -- Continental level
        WHEN p_zoom <= 8 THEN 1.0    -- Country level
        WHEN p_zoom <= 10 THEN 0.5   -- Regional level
        WHEN p_zoom <= 12 THEN 0.25  -- City level
        WHEN p_zoom <= 14 THEN 0.1   -- District level
        ELSE 0.05                    -- Street level
    END;
    
    -- Minimum cluster size decreases as zoom increases
    -- This allows for more granular clusters at higher zooms
    min_cluster_size := CASE
        WHEN p_zoom <= 8 THEN 5      -- Require at least 5 facts for low zoom
        WHEN p_zoom <= 10 THEN 3     -- Require at least 3 facts for medium zoom
        WHEN p_zoom <= 12 THEN 2     -- Require at least 2 facts for higher zoom
        ELSE 1                       -- Show individual facts at highest zoom
    END;

    RETURN QUERY
    WITH clustered_facts AS (
        SELECT 
            CONCAT(
                FLOOR(latitude / grid_size) * grid_size, 
                ',', 
                FLOOR(longitude / grid_size) * grid_size
            ) as grid_cell,
            latitude,
            longitude,
            id
        FROM facts
        WHERE 
            latitude BETWEEN p_south AND p_north
            AND longitude BETWEEN p_west AND p_east
            AND latitude IS NOT NULL 
            AND longitude IS NOT NULL
            AND status IN ('verified', 'pending')
    ),
    cluster_stats AS (
        SELECT 
            grid_cell,
            COUNT(*) as fact_count,
            AVG(latitude) as avg_lat,
            AVG(longitude) as avg_lng,
            MIN(latitude) as min_lat,
            MAX(latitude) as max_lat,
            MIN(longitude) as min_lng,
            MAX(longitude) as max_lng
        FROM clustered_facts
        GROUP BY grid_cell
        HAVING COUNT(*) >= min_cluster_size
    )
    SELECT 
        cs.grid_cell as cluster_id,
        cs.avg_lat as cluster_latitude,
        cs.avg_lng as cluster_longitude,
        cs.fact_count::INTEGER as cluster_count,
        JSON_BUILD_OBJECT(
            'north', cs.max_lat,
            'south', cs.min_lat,
            'east', cs.max_lng,
            'west', cs.min_lng
        )::TEXT as cluster_bounds
    FROM cluster_stats cs
    ORDER BY cs.fact_count DESC;
END;
$$ LANGUAGE plpgsql;