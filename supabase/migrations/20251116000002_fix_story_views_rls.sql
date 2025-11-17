-- Fix story_views table RLS policies
-- SECURITY ISSUE: "System can read story views" policy with USING (true)
-- allows anyone to read ALL view analytics data including IP addresses and user agents

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can read story views" ON public.story_views;

-- Create restrictive policies for story_views

-- Story owners can view analytics for their own stories
CREATE POLICY "Story owners can view their story analytics"
  ON public.story_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stories
      WHERE stories.id = story_views.story_id
      AND stories.user_id = auth.uid()
    )
  );

-- Users can view their own viewing history
CREATE POLICY "Users can view their own viewing history"
  ON public.story_views
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all analytics (check user_roles table)
CREATE POLICY "Admins can view all story analytics"
  ON public.story_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'moderator')
    )
  );

-- Keep the insert policy (anyone can track views)
-- This is fine because users only insert their own view data

-- Add helpful comments
COMMENT ON POLICY "Story owners can view their story analytics" ON public.story_views IS
  'Story creators can view analytics for their own content, not others.';

COMMENT ON TABLE public.story_views IS
  'View analytics contains sensitive data (IP, user agent). Only accessible to story owner, viewing user, and admins.';

-- Create a safe aggregated view for public consumption (no PII)
CREATE OR REPLACE VIEW public.story_analytics_public AS
SELECT
  story_id,
  COUNT(*) as total_views,
  COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(watch_duration) as avg_watch_duration,
  DATE_TRUNC('hour', viewed_at) as hour_bucket
FROM public.story_views
GROUP BY story_id, DATE_TRUNC('hour', viewed_at);

-- Grant public read access to aggregated view (no PII)
GRANT SELECT ON public.story_analytics_public TO authenticated;
GRANT SELECT ON public.story_analytics_public TO anon;

COMMENT ON VIEW public.story_analytics_public IS
  'Public aggregated analytics without PII. Safe for public consumption.';
