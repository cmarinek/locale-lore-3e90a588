-- Enable realtime for facts table
ALTER TABLE public.facts REPLICA IDENTITY FULL;

-- Add facts table to realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'facts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.facts;
  END IF;
END $$;