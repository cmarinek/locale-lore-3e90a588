-- Create content_reports table for admin moderation
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_content_type TEXT NOT NULL CHECK (reported_content_type IN ('fact', 'comment', 'profile')),
  reported_content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'misinformation', 'harassment', 'copyright', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for content_reports
CREATE POLICY "Users can create reports" 
ON public.content_reports 
FOR INSERT 
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports" 
ON public.content_reports 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
));

CREATE POLICY "Admins can update reports" 
ON public.content_reports 
FOR UPDATE 
USING (auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
));

-- Create system_metrics table for admin analytics
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for system_metrics
CREATE POLICY "Admins can view metrics" 
ON public.system_metrics 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
));

CREATE POLICY "System can insert metrics" 
ON public.system_metrics 
FOR INSERT 
WITH CHECK (true);

-- Create admin_actions table to track admin activities
CREATE TABLE public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_actions
CREATE POLICY "Admins can view admin actions" 
ON public.admin_actions 
FOR SELECT 
USING (auth.uid() IN (
  SELECT user_id FROM user_roles WHERE role = 'admin'
));

CREATE POLICY "System can insert admin actions" 
ON public.admin_actions 
FOR INSERT 
WITH CHECK (auth.uid() = admin_id);

-- Create indexes for better performance
CREATE INDEX idx_content_reports_status ON public.content_reports(status);
CREATE INDEX idx_content_reports_created_at ON public.content_reports(created_at DESC);
CREATE INDEX idx_system_metrics_name_time ON public.system_metrics(metric_name, recorded_at DESC);
CREATE INDEX idx_admin_actions_admin_time ON public.admin_actions(admin_id, created_at DESC);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log admin actions when facts are updated by admins
  IF TG_TABLE_NAME = 'facts' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.admin_actions (
      admin_id,
      action_type,
      target_type,
      target_id,
      details
    ) VALUES (
      auth.uid(),
      'fact_status_update',
      'fact',
      NEW.id,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'fact_title', NEW.title
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for fact status updates
CREATE TRIGGER log_fact_admin_actions
  AFTER UPDATE ON public.facts
  FOR EACH ROW
  EXECUTE FUNCTION public.log_admin_action();