-- Create storage bucket for mobile app builds
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'builds', 
  'builds', 
  false, 
  104857600, -- 100MB limit
  ARRAY['application/vnd.android.package-archive', 'application/octet-stream']
);

-- Create table for build logs
CREATE TABLE public.build_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'completed', 'failed', 'cancelled')),
  user_id UUID NOT NULL,
  app_name TEXT NOT NULL,
  bundle_id TEXT NOT NULL,
  download_url TEXT,
  error_message TEXT,
  build_config JSONB DEFAULT '{}',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Enable RLS
ALTER TABLE public.build_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for build_logs
CREATE POLICY "Admins can manage build logs"
ON public.build_logs
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- Create storage policies for builds bucket
CREATE POLICY "Admins can upload build files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'builds' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can view build files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'builds' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete build files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'builds' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- Create function to cleanup expired builds
CREATE OR REPLACE FUNCTION public.cleanup_expired_builds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete expired build files from storage
  DELETE FROM storage.objects
  WHERE bucket_id = 'builds'
  AND created_at < now() - INTERVAL '7 days';
  
  -- Update expired build records
  UPDATE public.build_logs
  SET status = 'expired'
  WHERE expires_at < now()
  AND status IN ('completed', 'failed');
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_build_logs_user_id ON public.build_logs(user_id);
CREATE INDEX idx_build_logs_status ON public.build_logs(status);
CREATE INDEX idx_build_logs_created_at ON public.build_logs(created_at DESC);
CREATE INDEX idx_build_logs_platform ON public.build_logs(platform);