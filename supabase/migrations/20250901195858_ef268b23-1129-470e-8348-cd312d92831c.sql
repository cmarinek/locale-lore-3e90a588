-- Create tables for managing automated fact acquisition jobs
CREATE TABLE public.acquisition_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
  source_type TEXT NOT NULL CHECK (source_type IN ('wikipedia', 'wikimedia', 'mixed')),
  target_count INTEGER NOT NULL DEFAULT 100,
  processed_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  configuration JSONB NOT NULL DEFAULT '{}',
  progress_data JSONB DEFAULT '{}',
  error_log TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion TIMESTAMP WITH TIME ZONE
);

-- Create acquisition queue for processing individual items
CREATE TABLE public.acquisition_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.acquisition_jobs(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('fact', 'media')),
  source_url TEXT,
  source_data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  result_data JSONB DEFAULT '{}',
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.acquisition_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acquisition_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (using correct profiles.id column)
CREATE POLICY "Admin can manage acquisition jobs" 
ON public.acquisition_jobs 
FOR ALL 
USING (auth.uid() IN (
  SELECT id FROM public.profiles WHERE auth.uid() = id AND EXISTS (
    SELECT 1 FROM public.user_activity_log 
    WHERE user_id = auth.uid() AND activity_type = 'admin_access'
  )
));

CREATE POLICY "Admin can manage acquisition queue" 
ON public.acquisition_queue 
FOR ALL 
USING (auth.uid() IN (
  SELECT id FROM public.profiles WHERE auth.uid() = id AND EXISTS (
    SELECT 1 FROM public.user_activity_log 
    WHERE user_id = auth.uid() AND activity_type = 'admin_access'
  )
));

-- Create indexes for performance
CREATE INDEX idx_acquisition_jobs_status ON public.acquisition_jobs(status);
CREATE INDEX idx_acquisition_jobs_created_at ON public.acquisition_jobs(created_at);
CREATE INDEX idx_acquisition_queue_job_id ON public.acquisition_queue(job_id);
CREATE INDEX idx_acquisition_queue_status ON public.acquisition_queue(status);
CREATE INDEX idx_acquisition_queue_item_type ON public.acquisition_queue(item_type);

-- Create function to update timestamps
CREATE TRIGGER update_acquisition_jobs_updated_at
BEFORE UPDATE ON public.acquisition_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_acquisition_queue_updated_at
BEFORE UPDATE ON public.acquisition_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();