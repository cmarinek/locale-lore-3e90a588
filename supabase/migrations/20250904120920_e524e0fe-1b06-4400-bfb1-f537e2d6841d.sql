-- Create stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'carousel')),
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  geolocation GEOGRAPHY(POINT) GENERATED ALWAYS AS (
    CASE 
      WHEN latitude IS NOT NULL AND longitude IS NOT NULL 
      THEN ST_MakePoint(longitude, latitude)::GEOGRAPHY
      ELSE NULL 
    END
  ) STORED,
  hashtags TEXT[] DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours'),
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Stories are viewable by everyone" 
ON public.stories 
FOR SELECT 
USING (is_active = true AND expires_at > now());

CREATE POLICY "Authenticated users can create stories" 
ON public.stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update their own stories" 
ON public.stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete their own stories" 
ON public.stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create story_likes table
CREATE TABLE public.story_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

-- Enable RLS for story_likes
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view story likes" 
ON public.story_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like stories" 
ON public.story_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" 
ON public.story_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create story_comments table
CREATE TABLE public.story_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for story_comments
ALTER TABLE public.story_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view story comments" 
ON public.story_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can comment on stories" 
ON public.story_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update their own comments" 
ON public.story_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Authors can delete their own comments" 
ON public.story_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create story_views table for analytics
CREATE TABLE public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  watch_duration INTEGER DEFAULT 0
);

-- Enable RLS for story_views
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can track story views" 
ON public.story_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can read story views" 
ON public.story_views 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_stories_user_id ON public.stories(user_id);
CREATE INDEX idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX idx_stories_is_trending ON public.stories(is_trending) WHERE is_trending = true;
CREATE INDEX idx_stories_created_at ON public.stories(created_at DESC);
CREATE INDEX idx_stories_geolocation ON public.stories USING GIST(geolocation) WHERE geolocation IS NOT NULL;
CREATE INDEX idx_stories_hashtags ON public.stories USING GIN(hashtags);

CREATE INDEX idx_story_likes_story_id ON public.story_likes(story_id);
CREATE INDEX idx_story_likes_user_story ON public.story_likes(user_id, story_id);

CREATE INDEX idx_story_comments_story_id ON public.story_comments(story_id);
CREATE INDEX idx_story_comments_created_at ON public.story_comments(created_at DESC);

CREATE INDEX idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX idx_story_views_viewed_at ON public.story_views(viewed_at);

-- Function to update story counts
CREATE OR REPLACE FUNCTION public.update_story_counts()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_story_like_count
  AFTER INSERT OR DELETE ON public.story_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_story_counts();

CREATE TRIGGER trigger_update_story_comment_count
  AFTER INSERT OR DELETE ON public.story_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_story_counts();

CREATE TRIGGER trigger_update_story_view_count
  AFTER INSERT ON public.story_views
  FOR EACH ROW EXECUTE FUNCTION public.update_story_counts();

-- Function to clean up expired stories
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  UPDATE public.stories 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to update trending stories based on engagement
CREATE OR REPLACE FUNCTION public.update_trending_stories()
RETURNS void AS $$
BEGIN
  -- Reset all trending flags
  UPDATE public.stories SET is_trending = false;
  
  -- Mark top engaging stories from last 24 hours as trending
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
$$ LANGUAGE plpgsql;