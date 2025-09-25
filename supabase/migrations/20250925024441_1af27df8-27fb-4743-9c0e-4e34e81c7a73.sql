-- Add favorite_cities column to profiles table to store user's preferred quick locations
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS favorite_cities JSONB DEFAULT '[]'::jsonb;

-- Add a comment to document the column structure
COMMENT ON COLUMN public.profiles.favorite_cities IS 'Array of favorite city objects with name, coordinates, and emoji. Example: [{"name": "New York", "emoji": "🏙️", "lat": 40.7128, "lng": -74.0060}]';