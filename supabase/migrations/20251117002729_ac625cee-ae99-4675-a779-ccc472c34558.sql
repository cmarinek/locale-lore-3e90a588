-- Fix subscribers table RLS policies
-- Remove overly permissive policies
DROP POLICY IF EXISTS "System can manage subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their subscription" ON public.subscribers;

-- Add secure owner-only policies
CREATE POLICY "Users can view own subscription"
ON public.subscribers FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Users can update own subscription"
ON public.subscribers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR email = auth.email())
WITH CHECK (auth.uid() = user_id OR email = auth.email());

-- Only authenticated service role can INSERT/DELETE (via edge functions)
CREATE POLICY "Service role can insert subscriptions"
ON public.subscribers FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can delete subscriptions"
ON public.subscribers FOR DELETE
TO service_role
USING (true);

-- Admins can view all (read-only for support)
CREATE POLICY "Admins can view all subscriptions"
ON public.subscribers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);