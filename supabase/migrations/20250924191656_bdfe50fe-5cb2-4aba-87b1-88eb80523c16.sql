-- Fix function search_path security warnings
-- Update existing functions to have proper search_path configuration

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
DECLARE
  username_base text;
  username_final text;
  counter integer := 1;
BEGIN
  -- Extract username from email (before @)
  username_base := split_part(NEW.email, '@', 1);
  username_final := username_base;
  
  -- Ensure username is unique by adding number if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = username_final) LOOP
    username_final := username_base || counter::text;
    counter := counter + 1;
  END LOOP;
  
  -- Insert profile with generated username
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, username_final);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If profile creation fails, still allow user creation
    RETURN NEW;
END;
$function$;

-- Update update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_story_counts function
CREATE OR REPLACE FUNCTION public.update_story_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update cleanup_expired_stories function
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.stories 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
END;
$function$;

-- Update cleanup_expired_builds function
CREATE OR REPLACE FUNCTION public.cleanup_expired_builds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update update_trending_stories function
CREATE OR REPLACE FUNCTION public.update_trending_stories()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update create_notification_bundle function
CREATE OR REPLACE FUNCTION public.create_notification_bundle(p_user_id uuid, p_type text, p_category text, p_title text, p_summary text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  bundle_id UUID;
BEGIN
  INSERT INTO public.notification_bundles (
    user_id, type, category, title, summary
  ) VALUES (
    p_user_id, p_type, p_category, p_title, p_summary
  ) RETURNING id INTO bundle_id;
  
  RETURN bundle_id;
END;
$function$;

-- Update add_to_bundle function
CREATE OR REPLACE FUNCTION public.add_to_bundle(p_notification_id uuid, p_bundle_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Update notification with bundle_id
  UPDATE public.enhanced_notifications 
  SET bundle_id = p_bundle_id
  WHERE id = p_notification_id;
  
  -- Update bundle count
  UPDATE public.notification_bundles 
  SET 
    notification_count = notification_count + 1,
    last_activity_at = now(),
    is_collapsed = CASE 
      WHEN notification_count + 1 >= collapse_after_count THEN true 
      ELSE is_collapsed 
    END
  WHERE id = p_bundle_id;
  
  RETURN true;
END;
$function$;