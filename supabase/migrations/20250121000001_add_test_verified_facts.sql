-- Add test verified facts for map markers
-- This migration adds sample verified facts across different locations and categories
-- to ensure map markers appear and can be tested

-- First, create a system test user if needed
DO $$
DECLARE
  test_user_id UUID;
  history_cat_id UUID;
  nature_cat_id UUID;
  culture_cat_id UUID;
  architecture_cat_id UUID;
  food_cat_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO history_cat_id FROM public.categories WHERE slug = 'history' LIMIT 1;
  SELECT id INTO nature_cat_id FROM public.categories WHERE slug = 'nature' LIMIT 1;
  SELECT id INTO culture_cat_id FROM public.categories WHERE slug = 'culture' LIMIT 1;
  SELECT id INTO architecture_cat_id FROM public.categories WHERE slug = 'architecture' LIMIT 1;
  SELECT id INTO food_cat_id FROM public.categories WHERE slug = 'food' LIMIT 1;

  -- Use the first existing user, or we'll need to skip if no users exist
  -- In production, this should be run after at least one user has signed up
  SELECT id INTO test_user_id FROM public.profiles LIMIT 1;

  -- Only insert facts if we have a user and categories
  IF test_user_id IS NOT NULL AND history_cat_id IS NOT NULL THEN

    -- Fact 1: Statue of Liberty (New York)
    INSERT INTO public.facts (
      title,
      description,
      location_name,
      latitude,
      longitude,
      category_id,
      status,
      author_id,
      media_urls,
      vote_count_up
    ) VALUES (
      'Statue of Liberty',
      'A colossal neoclassical sculpture on Liberty Island in New York Harbor. The statue is a figure of Libertas, a robed Roman liberty goddess.',
      'Liberty Island, New York, NY',
      40.6892,
      -74.0445,
      history_cat_id,
      'verified',
      test_user_id,
      ARRAY[]::TEXT[],
      42
    ) ON CONFLICT DO NOTHING;

    -- Fact 2: Golden Gate Bridge (San Francisco)
    INSERT INTO public.facts (
      title,
      description,
      location_name,
      latitude,
      longitude,
      category_id,
      status,
      author_id,
      media_urls,
      vote_count_up
    ) VALUES (
      'Golden Gate Bridge',
      'An iconic suspension bridge spanning the Golden Gate strait, the one-mile-wide channel between San Francisco Bay and the Pacific Ocean.',
      'Golden Gate Bridge, San Francisco, CA',
      37.8199,
      -122.4783,
      architecture_cat_id,
      'verified',
      test_user_id,
      ARRAY[]::TEXT[],
      89
    ) ON CONFLICT DO NOTHING;

    -- Fact 3: Central Park (New York)
    INSERT INTO public.facts (
      title,
      description,
      location_name,
      latitude,
      longitude,
      category_id,
      status,
      author_id,
      media_urls,
      vote_count_up
    ) VALUES (
      'Central Park',
      'An urban park in Manhattan, New York City. It is the fifth-largest park in the city, covering 843 acres.',
      'Central Park, Manhattan, NY',
      40.7829,
      -73.9654,
      nature_cat_id,
      'verified',
      test_user_id,
      ARRAY[]::TEXT[],
      156
    ) ON CONFLICT DO NOTHING;

    -- Fact 4: French Quarter (New Orleans)
    INSERT INTO public.facts (
      title,
      description,
      location_name,
      latitude,
      longitude,
      category_id,
      status,
      author_id,
      media_urls,
      vote_count_up
    ) VALUES (
      'French Quarter Historic District',
      'The oldest neighborhood in New Orleans, known for its French and Spanish Creole architecture and vibrant nightlife along Bourbon Street.',
      'French Quarter, New Orleans, LA',
      29.9584,
      -90.0644,
      culture_cat_id,
      'verified',
      test_user_id,
      ARRAY[]::TEXT[],
      73
    ) ON CONFLICT DO NOTHING;

    -- Fact 5: Pike Place Market (Seattle)
    INSERT INTO public.facts (
      title,
      description,
      location_name,
      latitude,
      longitude,
      category_id,
      status,
      author_id,
      media_urls,
      vote_count_up
    ) VALUES (
      'Pike Place Market',
      'One of the oldest continuously operated public farmers markets in the United States. Famous for its fish throwing tradition.',
      'Pike Place Market, Seattle, WA',
      47.6097,
      -122.3425,
      food_cat_id,
      'verified',
      test_user_id,
      ARRAY[]::TEXT[],
      91
    ) ON CONFLICT DO NOTHING;

    -- Fact 6: Grand Canyon (Arizona)
    INSERT INTO public.facts (
      title,
      description,
      location_name,
      latitude,
      longitude,
      category_id,
      status,
      author_id,
      media_urls,
      vote_count_up
    ) VALUES (
      'Grand Canyon South Rim',
      'A steep-sided canyon carved by the Colorado River in Arizona. It is 277 miles long, up to 18 miles wide, and over a mile deep.',
      'Grand Canyon Village, AZ',
      36.0544,
      -112.1401,
      nature_cat_id,
      'verified',
      test_user_id,
      ARRAY[]::TEXT[],
      203
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Successfully added test verified facts for map markers';
  ELSE
    RAISE NOTICE 'Skipping test facts - no users or categories found. Please ensure users exist first.';
  END IF;
END $$;
