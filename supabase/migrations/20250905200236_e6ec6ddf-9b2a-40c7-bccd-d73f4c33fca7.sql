-- Enable RLS on system_metrics table (likely missing RLS)
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for system_metrics
CREATE POLICY "Only admins can view system metrics"
ON public.system_metrics
FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "System can insert metrics"
ON public.system_metrics
FOR INSERT
WITH CHECK (true);

-- Create system_metrics table if it doesn't exist (for admin functionality)
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_unit text,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on system_metrics
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;