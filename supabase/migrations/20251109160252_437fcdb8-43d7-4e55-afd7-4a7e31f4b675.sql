-- Create table for user drawings on the map
CREATE TABLE IF NOT EXISTS public.map_drawings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  drawing_type TEXT NOT NULL CHECK (drawing_type IN ('polygon', 'line', 'circle', 'rectangle')),
  coordinates JSONB NOT NULL,
  style_properties JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.map_drawings ENABLE ROW LEVEL SECURITY;

-- Users can view their own drawings
CREATE POLICY "Users can view their own drawings"
ON public.map_drawings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view public drawings
CREATE POLICY "Anyone can view public drawings"
ON public.map_drawings
FOR SELECT
USING (is_public = true);

-- Users can create their own drawings
CREATE POLICY "Users can create their own drawings"
ON public.map_drawings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own drawings
CREATE POLICY "Users can update their own drawings"
ON public.map_drawings
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own drawings
CREATE POLICY "Users can delete their own drawings"
ON public.map_drawings
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_map_drawings_user_id ON public.map_drawings(user_id);
CREATE INDEX idx_map_drawings_share_token ON public.map_drawings(share_token);
CREATE INDEX idx_map_drawings_public ON public.map_drawings(is_public) WHERE is_public = true;

-- Add trigger for updated_at
CREATE TRIGGER update_map_drawings_updated_at
BEFORE UPDATE ON public.map_drawings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for collaborative features
ALTER PUBLICATION supabase_realtime ADD TABLE public.map_drawings;