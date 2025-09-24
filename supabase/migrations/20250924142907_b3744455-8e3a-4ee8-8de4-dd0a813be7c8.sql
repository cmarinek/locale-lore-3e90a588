-- Fix remaining function search_path issues and check RLS status

-- First, fix all remaining functions with missing search_path
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

CREATE OR REPLACE FUNCTION public.get_notification_preferences(p_user_id uuid)
RETURNS TABLE(email_enabled boolean, push_enabled boolean, in_app_enabled boolean, category_preferences jsonb, smart_bundling_enabled boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    np.email_enabled,
    np.push_enabled,
    np.in_app_enabled,
    np.category_preferences,
    np.smart_bundling_enabled
  FROM public.notification_preferences np
  WHERE np.user_id = p_user_id;
  
  -- If no preferences exist, return defaults
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      true::BOOLEAN,
      true::BOOLEAN,
      true::BOOLEAN,
      '{
        "social": {"email": true, "push": true, "in_app": true},
        "content": {"email": true, "push": false, "in_app": true},
        "system": {"email": true, "push": true, "in_app": true},
        "marketing": {"email": false, "push": false, "in_app": false},
        "security": {"email": true, "push": true, "in_app": true}
      }'::JSONB,
      true::BOOLEAN;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid, p_channel text DEFAULT 'in_app'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  notification_user_id UUID;
BEGIN
  -- Update notification status
  UPDATE public.enhanced_notifications 
  SET 
    status = 'read',
    read_at = now(),
    updated_at = now()
  WHERE id = p_notification_id AND auth.uid() = user_id
  RETURNING user_id INTO notification_user_id;
  
  -- Record analytics
  IF notification_user_id IS NOT NULL THEN
    INSERT INTO public.notification_analytics (
      notification_id, user_id, event_type, channel
    ) VALUES (
      p_notification_id, notification_user_id, 'viewed', p_channel
    );
  END IF;
  
  RETURN notification_user_id IS NOT NULL;
END;
$function$;

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

-- Check which tables still don't have RLS enabled and fix them
-- This will show us what needs to be addressed
DO $$
DECLARE
    r RECORD;
    rls_status BOOLEAN;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('spatial_ref_sys', 'geometry_columns', 'geography_columns')
    LOOP
        -- Check if RLS is enabled
        SELECT rowsecurity INTO rls_status 
        FROM pg_tables 
        WHERE schemaname = r.schemaname AND tablename = r.tablename;
        
        -- If not enabled, enable it
        IF NOT rls_status THEN
            EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
            RAISE NOTICE 'Enabled RLS on table: %.%', r.schemaname, r.tablename;
        END IF;
    END LOOP;
END $$;