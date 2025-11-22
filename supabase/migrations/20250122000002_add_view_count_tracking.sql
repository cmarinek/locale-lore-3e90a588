-- Add view_count column to facts table
ALTER TABLE public.facts
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;

-- Add index for sorting by view count
CREATE INDEX IF NOT EXISTS idx_facts_view_count ON public.facts(view_count DESC);

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_fact_view_count(fact_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE facts
  SET view_count = view_count + 1
  WHERE id = fact_id
  RETURNING view_count INTO new_count;

  RETURN new_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_fact_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_fact_view_count TO anon;

-- Add comment
COMMENT ON COLUMN public.facts.view_count IS 'Number of times this fact has been viewed';
COMMENT ON FUNCTION increment_fact_view_count IS 'Increment view count for a fact and return new count';
