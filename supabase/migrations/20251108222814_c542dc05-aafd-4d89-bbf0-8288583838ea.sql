-- Create security scan history table
CREATE TABLE IF NOT EXISTS public.security_scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  security_score INTEGER NOT NULL,
  critical_count INTEGER NOT NULL DEFAULT 0,
  high_count INTEGER NOT NULL DEFAULT 0,
  medium_count INTEGER NOT NULL DEFAULT 0,
  low_count INTEGER NOT NULL DEFAULT 0,
  total_findings INTEGER NOT NULL DEFAULT 0,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  categories JSONB NOT NULL DEFAULT '{}'::jsonb,
  scan_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_security_scan_history_scan_date ON public.security_scan_history(scan_date DESC);

-- Enable RLS
ALTER TABLE public.security_scan_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view scan history
CREATE POLICY "Admins can view scan history"
ON public.security_scan_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- System can insert scan results
CREATE POLICY "System can insert scan results"
ON public.security_scan_history
FOR INSERT
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.security_scan_history IS 'Historical security scan results for trend analysis';