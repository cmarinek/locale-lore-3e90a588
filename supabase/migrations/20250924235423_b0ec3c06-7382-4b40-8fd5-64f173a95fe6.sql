-- Create saved_locations table for user bookmarks
CREATE TABLE public.saved_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fact_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, fact_id)
);

-- Enable RLS
ALTER TABLE public.saved_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own saved locations" 
ON public.saved_locations 
FOR ALL 
USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.saved_locations 
ADD CONSTRAINT saved_locations_fact_id_fkey 
FOREIGN KEY (fact_id) REFERENCES public.facts(id) ON DELETE CASCADE;