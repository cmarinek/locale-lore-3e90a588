-- AI-driven discovery recommendations system

-- User preferences and behavior tracking
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_preferences JSONB NOT NULL DEFAULT '{}', -- {"history": 0.8, "nature": 0.6, ...}
  location_preferences JSONB NOT NULL DEFAULT '{}', -- {"latitude": 40.7, "longitude": -74.0, "radius": 5}
  discovery_time_preferences JSONB NOT NULL DEFAULT '{}', -- {"morning": 0.7, "afternoon": 0.3, ...}
  interaction_patterns JSONB NOT NULL DEFAULT '{}', -- click patterns, dwell time, etc.
  notification_preferences JSONB NOT NULL DEFAULT '{"enabled": true, "optimal_times": []}',
  last_location GEOMETRY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- User discovery history for collaborative filtering
CREATE TABLE public.user_discovery_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'share', 'save', 'comment'
  dwell_time INTEGER, -- seconds spent viewing
  location GEOMETRY(Point, 4326),
  device_info JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}', -- time of day, weather, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI-generated recommendations
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL, -- 'personalized', 'location', 'trending', 'collaborative'
  confidence_score FLOAT NOT NULL DEFAULT 0.0, -- 0.0 to 1.0
  reasoning TEXT, -- AI explanation for recommendation
  metadata JSONB DEFAULT '{}', -- additional AI insights
  is_delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  user_feedback TEXT, -- 'liked', 'dismissed', 'saved'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

-- Smart search analytics
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  query_embedding VECTOR(1536), -- OpenAI embeddings
  results_count INTEGER NOT NULL DEFAULT 0,
  selected_results JSONB DEFAULT '[]', -- which results were clicked
  search_context JSONB DEFAULT '{}', -- location, time, filters
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Discovery of the day
CREATE TABLE public.discovery_of_the_day (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_summary TEXT NOT NULL,
  fun_fact TEXT,
  engagement_score FLOAT DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Location-based notification triggers
CREATE TABLE public.location_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
  trigger_location GEOMETRY(Point, 4326) NOT NULL,
  trigger_radius INTEGER NOT NULL DEFAULT 200, -- meters
  notification_title TEXT NOT NULL,
  notification_body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_triggers_per_user INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User notification history
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'discovery_of_day', 'location_trigger', 'personalized'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  action_taken TEXT -- 'opened', 'dismissed', 'saved'
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_discovery_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_of_the_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Discovery history
CREATE POLICY "Users can view their own history" ON public.user_discovery_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to their history" ON public.user_discovery_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can manage history" ON public.user_discovery_history FOR ALL USING (true);

-- Recommendations
CREATE POLICY "Users can view their recommendations" ON public.ai_recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their feedback" ON public.ai_recommendations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage recommendations" ON public.ai_recommendations FOR ALL USING (true);

-- Search analytics
CREATE POLICY "Users can view their search data" ON public.search_analytics FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Anyone can add search data" ON public.search_analytics FOR INSERT WITH CHECK (true);

-- Discovery of the day
CREATE POLICY "Everyone can view discovery of the day" ON public.discovery_of_the_day FOR SELECT USING (true);
CREATE POLICY "System can manage discovery of the day" ON public.discovery_of_the_day FOR ALL USING (true);

-- Location triggers
CREATE POLICY "Everyone can view location triggers" ON public.location_triggers FOR SELECT USING (true);
CREATE POLICY "System can manage location triggers" ON public.location_triggers FOR ALL USING (true);

-- User notifications
CREATE POLICY "Users can view their notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage notifications" ON public.user_notifications FOR ALL USING (true);

-- Indexes for performance
CREATE INDEX idx_user_discovery_history_user_id ON public.user_discovery_history(user_id);
CREATE INDEX idx_user_discovery_history_fact_id ON public.user_discovery_history(fact_id);
CREATE INDEX idx_user_discovery_history_created_at ON public.user_discovery_history(created_at);
CREATE INDEX idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX idx_ai_recommendations_expires_at ON public.ai_recommendations(expires_at);
CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at);
CREATE INDEX idx_location_triggers_location ON public.location_triggers USING GIST(trigger_location);
CREATE INDEX idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX idx_user_notifications_delivered_at ON public.user_notifications(delivered_at);

-- Enable PostGIS for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Function to calculate user similarity for collaborative filtering
CREATE OR REPLACE FUNCTION public.calculate_user_similarity(user1_id UUID, user2_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  similarity_score FLOAT := 0.0;
  common_interactions INTEGER := 0;
  total_interactions INTEGER := 0;
BEGIN
  -- Calculate Jaccard similarity based on fact interactions
  SELECT 
    COUNT(CASE WHEN h1.fact_id = h2.fact_id THEN 1 END) AS common_facts,
    COUNT(DISTINCT h1.fact_id) + COUNT(DISTINCT h2.fact_id) - COUNT(CASE WHEN h1.fact_id = h2.fact_id THEN 1 END) AS total_unique_facts
  INTO common_interactions, total_interactions
  FROM user_discovery_history h1
  CROSS JOIN user_discovery_history h2
  WHERE h1.user_id = user1_id 
    AND h2.user_id = user2_id
    AND h1.interaction_type IN ('like', 'save', 'share')
    AND h2.interaction_type IN ('like', 'save', 'share');
  
  IF total_interactions > 0 THEN
    similarity_score := common_interactions::FLOAT / total_interactions::FLOAT;
  END IF;
  
  RETURN similarity_score;
END;
$$;

-- Function to get location-based triggers
CREATE OR REPLACE FUNCTION public.get_nearby_triggers(user_lat FLOAT, user_lng FLOAT, max_distance INTEGER DEFAULT 1000)
RETURNS TABLE(
  trigger_id UUID,
  fact_id UUID,
  title TEXT,
  body TEXT,
  distance_meters FLOAT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    lt.id,
    lt.fact_id,
    lt.notification_title,
    lt.notification_body,
    ST_Distance(
      ST_GeogFromWKB(ST_AsBinary(lt.trigger_location)),
      ST_GeogFromWKB(ST_AsBinary(ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)))
    ) as distance_meters
  FROM location_triggers lt
  WHERE lt.is_active = true
    AND ST_DWithin(
      ST_GeogFromWKB(ST_AsBinary(lt.trigger_location)),
      ST_GeogFromWKB(ST_AsBinary(ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326))),
      max_distance
    )
  ORDER BY distance_meters ASC;
$$;