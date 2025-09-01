-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('lore-media', 'lore-media', true);

-- Create storage policies for lore media uploads
CREATE POLICY "Anyone can view lore media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'lore-media');

CREATE POLICY "Authenticated users can upload lore media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'lore-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own lore media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'lore-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own lore media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'lore-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create submissions table for draft management and auto-save
CREATE TABLE public.lore_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  description TEXT,
  location_name TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  category_id UUID,
  media_urls TEXT[],
  step_completed INTEGER DEFAULT 1,
  is_draft BOOLEAN DEFAULT true,
  submission_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lore_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for submissions
CREATE POLICY "Users can create their own submissions" 
ON public.lore_submissions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions" 
ON public.lore_submissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" 
ON public.lore_submissions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions" 
ON public.lore_submissions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_lore_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lore_submissions_updated_at
BEFORE UPDATE ON public.lore_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_lore_submissions_updated_at();