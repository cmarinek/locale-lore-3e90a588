-- Grant admin role to current user (replace with actual user ID if needed)
-- First, let's check if there are any users and grant admin role to the first user
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO first_user_id 
    FROM auth.users 
    LIMIT 1;
    
    -- If a user exists, grant them admin role
    IF first_user_id IS NOT NULL THEN
        -- Remove any existing roles for this user
        DELETE FROM public.user_roles 
        WHERE user_id = first_user_id;
        
        -- Add admin role
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (first_user_id, 'admin');
        
        RAISE NOTICE 'Admin role granted to user: %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found in the system';
    END IF;
END $$;

-- Insert some test content reports for testing
INSERT INTO public.content_reports (
    reporter_id,
    reported_content_type,
    reported_content_id,
    reason,
    description,
    status
) VALUES 
(
    (SELECT id FROM auth.users LIMIT 1),
    'fact',
    gen_random_uuid(),
    'inappropriate',
    'This content contains inappropriate language and should be reviewed.',
    'pending'
),
(
    (SELECT id FROM auth.users LIMIT 1),
    'comment',
    gen_random_uuid(),
    'spam',
    'This comment appears to be spam with promotional content.',
    'pending'
),
(
    (SELECT id FROM auth.users LIMIT 1),
    'fact',
    gen_random_uuid(),
    'fake',
    'This fact appears to contain false information that needs verification.',
    'reviewed'
) ON CONFLICT DO NOTHING;