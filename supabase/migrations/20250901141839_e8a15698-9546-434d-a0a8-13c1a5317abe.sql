-- Create admin user roles and permissions system
CREATE TYPE public.user_role_type AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, check_role user_role_type)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = has_role.user_id 
    AND role = check_role
  );
$$;

-- Create policies for user_roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (has_role(auth.uid(), 'admin'::user_role_type));

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Create reports table for content reporting
CREATE TABLE public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  reported_content_type TEXT NOT NULL, -- 'fact', 'comment', 'user'
  reported_content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.content_reports
FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage reports" ON public.content_reports
FOR ALL USING (has_role(auth.uid(), 'admin'::user_role_type) OR has_role(auth.uid(), 'moderator'::user_role_type));

-- Create system_metrics table for monitoring
CREATE TABLE public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view metrics" ON public.system_metrics
FOR SELECT USING (has_role(auth.uid(), 'admin'::user_role_type));

-- Create AB test configurations
CREATE TABLE public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  traffic_allocation NUMERIC DEFAULT 0.5 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 1),
  variants JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage AB tests" ON public.ab_tests
FOR ALL USING (has_role(auth.uid(), 'admin'::user_role_type));

-- Create content flagging rules
CREATE TABLE public.content_flagging_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'keyword', 'pattern', 'ml_score'
  rule_config JSONB NOT NULL,
  action TEXT NOT NULL, -- 'flag', 'auto_remove', 'require_approval'
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.content_flagging_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage flagging rules" ON public.content_flagging_rules
FOR ALL USING (has_role(auth.uid(), 'admin'::user_role_type));

-- Add admin user (you'll need to replace with actual user ID)
-- This is commented out as it requires an actual user ID
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin');