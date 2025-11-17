-- Fix subscriptions table RLS policies
-- SECURITY ISSUE: "Service role can manage subscriptions" policy with USING (true)
-- is overly permissive and allows any authenticated request to manipulate all subscriptions

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Service role can manage payment sessions" ON public.payment_sessions;

-- Create proper restrictive policies for subscriptions
-- Only allow users to UPDATE/DELETE their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can manage all subscriptions (check user_roles table)
CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Stripe webhooks need service role key to insert/update subscriptions
-- This is handled via service role key in edge functions, no RLS policy needed

-- Create proper restrictive policies for payments
CREATE POLICY "Users can delete their own payment records"
  ON public.payments
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payments"
  ON public.payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create proper restrictive policies for payment_sessions
CREATE POLICY "Users can delete their own payment sessions"
  ON public.payment_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payment sessions"
  ON public.payment_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Add helpful comment
COMMENT ON POLICY "Admins can manage all subscriptions" ON public.subscriptions IS
  'Admins can view/modify/delete all subscriptions. Verified via user_roles table, not client metadata.';

COMMENT ON TABLE public.subscriptions IS
  'Subscription data is highly sensitive. Only owner and admins have access. Stripe webhooks use service role key.';
