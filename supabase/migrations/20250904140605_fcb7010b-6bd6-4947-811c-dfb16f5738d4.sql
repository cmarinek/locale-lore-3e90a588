-- Fix RLS policies and database security issues

-- 1. Enable RLS on geography_columns and geometry_columns if they don't have it
ALTER TABLE IF EXISTS public.geography_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.geometry_columns ENABLE ROW LEVEL SECURITY;

-- 2. Fix the database functions to have secure search_path
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

-- 3. Create the missing has_role function for RLS policies
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role user_role_type)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = $1 AND user_roles.role = $2
  );
$function$;

-- 4. Fix the missing profiles relationship by creating proper foreign key
-- First, ensure all users have profiles
INSERT INTO public.profiles (id, username, reputation_score)
SELECT 
  auth.users.id,
  COALESCE(auth.users.email, 'user_' || auth.users.id::text),
  0
FROM auth.users
LEFT JOIN public.profiles ON profiles.id = auth.users.id
WHERE profiles.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 5. Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- 6. Create enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('user', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;