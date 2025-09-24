-- Final simple sample data population using existing admin user
DO $$
DECLARE
    admin_user_id UUID;
    fact_ids UUID[];
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM auth.users LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No user found in auth.users table';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using admin user ID: %', admin_user_id;
    
    -- Get fact IDs for later use
    SELECT ARRAY(SELECT id FROM facts LIMIT 10) INTO fact_ids;
    
    -- Enhance existing facts with realistic media
    UPDATE facts SET 
        image_url = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop',
        media_urls = ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop']
    WHERE image_url IS NULL;
    
    -- Add some engaging stories
    INSERT INTO stories (
        user_id, title, content, media_urls, media_type, location_name, latitude, longitude,
        hashtags, view_count, like_count, comment_count, created_at
    ) VALUES 
    (admin_user_id, 'My Journey Through Ancient Rome', 
     'Walking through the cobblestone streets of Rome, I discovered this incredible hidden courtyard that most tourists never see. The local café owner told me it dates back to the 12th century.',
     ARRAY['https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop'], 'image',
     'Rome, Italy', 41.9028, 12.4964,
     ARRAY['#rome', '#history', '#hidden'], 234, 12, 8, now() - interval '3 days'),
     
    (admin_user_id, 'Cherry Blossom Secrets in Kyoto',
     'Found this secluded temple garden during cherry blossom season. The monks here have been maintaining these trees for over 400 years.',
     ARRAY['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop'], 'image',
     'Kyoto, Japan', 35.0116, 135.7681,
     ARRAY['#kyoto', '#cherryblossoms'], 189, 23, 15, now() - interval '1 week'),
     
    (admin_user_id, 'Underground Edinburgh',
     'Edinburgh Royal Mile hides an entire underground city. These tunnels were once home to hundreds of people.',
     ARRAY['https://images.unsplash.com/photo-1539650116574-75c0c6d73f6d?w=800&h=600&fit=crop'], 'image',
     'Edinburgh, Scotland', 55.9533, -3.1883,
     ARRAY['#edinburgh', '#underground'], 156, 18, 12, now() - interval '2 weeks');
    
    -- Make fact votes more realistic
    UPDATE facts SET 
        vote_count_up = floor(random() * 25 + 5)::int,
        vote_count_down = floor(random() * 2)::int;
    
    -- Add discovery of the day entry
    INSERT INTO discovery_of_the_day (fact_id, ai_summary, fun_fact, date, engagement_score) VALUES
    (fact_ids[1], 
     'This remarkable location showcases centuries of cultural evolution and human ingenuity.',
     'The ancient construction techniques used here were ahead of their time!',
     CURRENT_DATE, 85.7);
    
    RAISE NOTICE 'Successfully populated database with sample data for user: %', admin_user_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        RAISE;
END $$;