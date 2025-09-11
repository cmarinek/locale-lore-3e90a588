-- Add admin role for current authenticated user (this will work when user is logged in)
-- First, let's check the current authenticated user and add admin role
INSERT INTO user_roles (user_id, role) 
SELECT auth.uid(), 'admin'::user_role_type 
WHERE auth.uid() IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::user_role_type
);