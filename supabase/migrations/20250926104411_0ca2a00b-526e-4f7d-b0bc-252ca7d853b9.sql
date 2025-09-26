-- Add foreign key constraint between fact_comments and profiles
ALTER TABLE public.fact_comments 
ADD CONSTRAINT fact_comments_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;