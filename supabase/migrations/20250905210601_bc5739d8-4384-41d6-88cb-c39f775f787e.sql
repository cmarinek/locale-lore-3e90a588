-- Create system_metrics table for admin analytics if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_unit text,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for system_metrics if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'system_metrics' 
    AND policyname = 'Admins can manage system metrics'
  ) THEN
    ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Admins can manage system metrics" ON public.system_metrics
      FOR ALL USING (
        auth.uid() IN (
          SELECT user_id FROM public.user_roles WHERE role = 'admin'
        )
      );
  END IF;
END $$;

-- Insert some sample system metrics
INSERT INTO public.system_metrics (metric_name, metric_value, metric_unit, metadata) VALUES
  ('total_api_calls', 15420, 'calls', '{"endpoint": "all", "period": "24h"}'),
  ('average_response_time', 85, 'ms', '{"endpoint": "all", "period": "24h"}'),
  ('database_connections', 12, 'connections', '{"type": "active"}'),
  ('storage_usage', 2.5, 'GB', '{"type": "media_files"}'),
  ('cache_hit_rate', 92.5, 'percent', '{"type": "redis"}')
ON CONFLICT DO NOTHING;