-- Fix Function Search Path Security Issues
-- Update all database functions to use SECURITY DEFINER with proper search_path

-- 1. Update cleanup_expired_builds function
CREATE OR REPLACE FUNCTION public.cleanup_expired_builds()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'builds'
  AND created_at < now() - INTERVAL '7 days';
  
  UPDATE public.build_logs
  SET status = 'expired'
  WHERE expires_at < now()
  AND status IN ('completed', 'failed');
END;
$function$;

-- 2. Update cleanup_expired_stories function
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.stories 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$function$;

-- 3. Update update_trending_stories function
CREATE OR REPLACE FUNCTION public.update_trending_stories()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.stories SET is_trending = false;
  
  WITH trending_candidates AS (
    SELECT id,
           (view_count * 0.1 + like_count * 2 + comment_count * 5) as engagement_score
    FROM public.stories 
    WHERE created_at > now() - interval '24 hours'
      AND is_active = true
    ORDER BY engagement_score DESC
    LIMIT 10
  )
  UPDATE public.stories 
  SET is_trending = true 
  WHERE id IN (SELECT id FROM trending_candidates);
END;
$function$;

-- 4. Update update_story_counts function
CREATE OR REPLACE FUNCTION public.update_story_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'story_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories 
      SET like_count = like_count + 1 
      WHERE id = NEW.story_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.stories 
      SET like_count = GREATEST(0, like_count - 1) 
      WHERE id = OLD.story_id;
      RETURN OLD;
    END IF;
  ELSIF TG_TABLE_NAME = 'story_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories 
      SET comment_count = comment_count + 1 
      WHERE id = NEW.story_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.stories 
      SET comment_count = GREATEST(0, comment_count - 1) 
      WHERE id = OLD.story_id;
      RETURN OLD;
    END IF;
  ELSIF TG_TABLE_NAME = 'story_views' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.stories 
      SET view_count = view_count + 1 
      WHERE id = NEW.story_id;
      RETURN NEW;
    END IF;
  END IF;
  RETURN NULL;
END;
$function$;

-- 5. Update get_fact_clusters function
CREATE OR REPLACE FUNCTION public.get_fact_clusters(p_north double precision, p_south double precision, p_east double precision, p_west double precision, p_zoom integer DEFAULT 10)
 RETURNS TABLE(cluster_id text, cluster_latitude double precision, cluster_longitude double precision, cluster_count integer, cluster_bounds jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  grid_size DOUBLE PRECISION;
  min_cluster_size INTEGER;
  longitude_condition TEXT;
BEGIN
  -- Calculate progressive grid size based on zoom level
  grid_size := CASE 
    WHEN p_zoom <= 2 THEN 10.0     -- Continental view
    WHEN p_zoom <= 4 THEN 5.0      -- Large country view  
    WHEN p_zoom <= 6 THEN 2.0      -- Country view
    WHEN p_zoom <= 8 THEN 1.0      -- Region view
    WHEN p_zoom <= 10 THEN 0.5     -- State/province view
    WHEN p_zoom <= 12 THEN 0.25    -- City view
    WHEN p_zoom <= 14 THEN 0.1     -- District view
    ELSE 0.05                      -- Street view
  END;

  -- Set minimum cluster size - smaller clusters at higher zoom levels
  min_cluster_size := CASE 
    WHEN p_zoom >= 14 THEN 1       -- Show individual facts at street level
    WHEN p_zoom >= 12 THEN 2       -- Small clusters at city level
    WHEN p_zoom >= 10 THEN 3       -- Medium clusters at state level
    ELSE 5                         -- Larger clusters at regional+ level
  END;

  -- Handle longitude bounds crossing the international date line
  IF p_west > p_east THEN
    longitude_condition := 'OR (CAST(longitude AS DOUBLE PRECISION) >= ' || p_west || ' OR CAST(longitude AS DOUBLE PRECISION) <= ' || p_east || ')';
  ELSE
    longitude_condition := 'AND CAST(longitude AS DOUBLE PRECISION) BETWEEN ' || p_west || ' AND ' || p_east;
  END IF;

  -- Log the parameters for debugging
  RAISE LOG 'get_fact_clusters: zoom=%, grid_size=%, min_cluster_size=%, bounds=(%, %, %, %)', 
    p_zoom, grid_size, min_cluster_size, p_north, p_south, p_east, p_west;

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
        MAX(CAST(longitude AS DOUBLE PRECISION)) as max_lng
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
      ) as cluster_bounds
    FROM clustered_facts
    ORDER BY fact_count DESC',
    grid_size, grid_size, grid_size,  -- cluster_lat calculation
    grid_size, grid_size, grid_size,  -- cluster_lng calculation
    p_south, p_north,                 -- latitude bounds
    longitude_condition,              -- longitude condition
    grid_size, grid_size,             -- GROUP BY grid calculations
    min_cluster_size                  -- HAVING clause
  );
END;
$function$;

-- 6. Update get_optimized_fact_clusters function
CREATE OR REPLACE FUNCTION public.get_optimized_fact_clusters(p_north double precision, p_south double precision, p_east double precision, p_west double precision, p_zoom integer DEFAULT 10, p_limit integer DEFAULT 1000)
 RETURNS TABLE(cluster_id text, cluster_latitude double precision, cluster_longitude double precision, cluster_count integer, cluster_bounds jsonb, sample_facts jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  grid_size DOUBLE PRECISION;
  min_cluster_size INTEGER;
BEGIN
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

  RETURN QUERY
  WITH clustered_facts AS (
    SELECT 
      FLOOR(CAST(latitude AS DOUBLE PRECISION) / grid_size) * grid_size + grid_size/2 as cluster_lat,
      FLOOR(CAST(longitude AS DOUBLE PRECISION) / grid_size) * grid_size + grid_size/2 as cluster_lng,
      COUNT(*) as fact_count,
      MIN(CAST(latitude AS DOUBLE PRECISION)) as min_lat,
      MAX(CAST(latitude AS DOUBLE PRECISION)) as max_lat,
      MIN(CAST(longitude AS DOUBLE PRECISION)) as min_lng,
      MAX(CAST(longitude AS DOUBLE PRECISION)) as max_lng,
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', title,
          'location_name', location_name
        ) ORDER BY created_at DESC
      ) as sample_facts
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
    ORDER BY fact_count DESC
    LIMIT p_limit
  )
  SELECT 
    cluster_lat::TEXT || ',' || cluster_lng::TEXT,
    cluster_lat,
    cluster_lng,
    fact_count::INTEGER,
    jsonb_build_object(
      'north', max_lat,
      'south', min_lat,
      'east', max_lng,
      'west', min_lng
    ),
    sample_facts
  FROM clustered_facts;
END;
$function$;

-- Enable RLS on tables that need it (identified by the linter)
-- Based on the schema, we need to check which tables are missing RLS

-- Create user_statistics table if it doesn't exist and enable RLS
CREATE TABLE IF NOT EXISTS public.user_statistics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    facts_submitted integer DEFAULT 0,
    votes_cast integer DEFAULT 0,
    comments_made integer DEFAULT 0,
    streak_days integer DEFAULT 0,
    points_earned integer DEFAULT 0,
    last_activity timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_statistics
CREATE POLICY "Users can view their own statistics" 
ON public.user_statistics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" 
ON public.user_statistics 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user statistics" 
ON public.user_statistics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user_settings table if it doesn't exist and enable RLS
CREATE TABLE IF NOT EXISTS public.user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme text DEFAULT 'light',
    language text DEFAULT 'en',
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    in_app_notifications boolean DEFAULT true,
    marketing_emails boolean DEFAULT false,
    profile_visibility text DEFAULT 'public',
    location_sharing boolean DEFAULT true,
    discovery_radius integer DEFAULT 50,
    activity_tracking boolean DEFAULT true,
    data_processing_consent boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_settings
CREATE POLICY "Users can manage their own settings" 
ON public.user_settings 
FOR ALL 
USING (auth.uid() = user_id);

-- Create user_roles table if it doesn't exist and enable RLS
CREATE TYPE IF NOT EXISTS public.user_role_type AS ENUM ('admin', 'moderator', 'contributor', 'user');

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'user',
    granted_by uuid REFERENCES auth.users(id),
    granted_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (has_role(auth.uid(), 'admin'));