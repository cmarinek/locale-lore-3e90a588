-- Create system_metrics table for admin analytics
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_unit text,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role user_role_type NOT NULL DEFAULT 'free',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for system_metrics
CREATE POLICY "Admins can manage system metrics" ON public.system_metrics
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );

-- Create policies for user_roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Insert some sample system metrics
INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, metadata) VALUES
  ('total_api_calls', 15420, 'calls', '{"endpoint": "all", "period": "24h"}'),
  ('average_response_time', 85, 'ms', '{"endpoint": "all", "period": "24h"}'),
  ('database_connections', 12, 'connections', '{"type": "active"}'),
  ('storage_usage', 2.5, 'GB', '{"type": "media_files"}'),
  ('cache_hit_rate', 92.5, 'percent', '{"type": "redis"}');

-- Function to collect basic metrics
CREATE OR REPLACE FUNCTION public.collect_system_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user counts
  INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, metadata)
  SELECT 'total_users', COUNT(*), 'users', '{"type": "all_time"}'
  FROM public.profiles;
  
  -- Update fact counts
  INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, metadata)
  SELECT 'total_facts', COUNT(*), 'facts', '{"type": "all_time"}'
  FROM public.facts;
  
  -- Update verified fact counts
  INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, metadata)
  SELECT 'verified_facts', COUNT(*), 'facts', '{"type": "verified"}'
  FROM public.facts WHERE status = 'verified';
  
  -- Update pending fact counts
  INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, metadata)
  SELECT 'pending_facts', COUNT(*), 'facts', '{"type": "pending"}'
  FROM public.facts WHERE status = 'pending';
  
  -- Update subscriber counts
  INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, metadata)
  SELECT 'total_subscribers', COUNT(*), 'subscribers', '{"type": "active"}'
  FROM public.subscribers WHERE subscribed = true;
END;
$$;