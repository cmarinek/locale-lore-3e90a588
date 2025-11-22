-- Migration: Add metadata fields to facts table for enhanced fact submission
-- Date: 2025-01-22
-- Description: Adds tags, source_url, and time_period fields to support richer fact data

-- Add tags array field for categorization and search
ALTER TABLE public.facts
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add source URL for fact verification and references
ALTER TABLE public.facts
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add time period for historical context (e.g., "1776", "1920s", "Medieval Era")
ALTER TABLE public.facts
ADD COLUMN IF NOT EXISTS time_period TEXT;

-- Add index on tags for faster searches
CREATE INDEX IF NOT EXISTS idx_facts_tags ON public.facts USING GIN (tags);

-- Add comment for documentation
COMMENT ON COLUMN public.facts.tags IS 'Array of tags for categorization and search (e.g., ["colonial", "revolution", "founding-fathers"])';
COMMENT ON COLUMN public.facts.source_url IS 'URL to source material for fact verification';
COMMENT ON COLUMN public.facts.time_period IS 'Historical time period or date range (e.g., "1776", "1920s", "Medieval Era")';
