-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "System can update statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "System can insert statistics" ON public.user_statistics;

-- Recreate RLS policies
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own statistics" ON public.user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can update statistics" ON public.user_statistics
  FOR UPDATE USING (true);

CREATE POLICY "System can insert statistics" ON public.user_statistics
  FOR INSERT WITH CHECK (true);