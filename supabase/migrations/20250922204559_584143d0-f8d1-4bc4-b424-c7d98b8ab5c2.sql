-- Create user_role_type enum and user tables with proper RLS
CREATE TYPE public.user_role_type AS ENUM ('admin', 'moderator', 'contributor', 'user');

-- Create user_statistics table and enable RLS
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

-- Create user_settings table and enable RLS
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

-- Create user_roles table and enable RLS
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