-- Drop and recreate the has_role function with correct parameters
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role_type);

-- Create the has_role function with correct parameter names
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role_type)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = _user_id AND user_roles.role = _role
  );
$function$;

-- Update all database functions to have secure search_path
CREATE OR REPLACE FUNCTION public.update_story_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.stories 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_trending_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;