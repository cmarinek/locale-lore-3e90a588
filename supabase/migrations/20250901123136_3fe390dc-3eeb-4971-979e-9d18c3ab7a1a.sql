-- Create comprehensive gamification system

-- User levels and XP system
CREATE TABLE public.user_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER NOT NULL DEFAULT 1,
  current_xp INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Points system
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'discovery', 'contribution', 'verification', 'share', 'comment', 'vote'
  points INTEGER NOT NULL,
  related_fact_id UUID REFERENCES public.facts(id),
  related_comment_id UUID REFERENCES public.fact_comments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  description TEXT
);

-- Discovery streaks
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL, -- 'daily_discovery', 'weekly_contribution'
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

-- Challenges system
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'special'
  target_value INTEGER NOT NULL,
  target_action TEXT NOT NULL, -- 'discover_facts', 'verify_facts', 'comment', 'share'
  reward_points INTEGER NOT NULL DEFAULT 0,
  reward_badge_id UUID REFERENCES public.achievements(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User challenge progress
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Leaderboards
CREATE TABLE public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL, -- 'global_points', 'global_discoveries', 'local_points', 'friends_points'
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('week', now()),
  period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (date_trunc('week', now()) + interval '1 week'),
  location_filter TEXT, -- for local leaderboards
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User levels
CREATE POLICY "Users can view all user levels" ON public.user_levels FOR SELECT USING (true);
CREATE POLICY "Users can update their own level" ON public.user_levels FOR ALL USING (auth.uid() = user_id);

-- User points
CREATE POLICY "Users can view all points" ON public.user_points FOR SELECT USING (true);
CREATE POLICY "System can manage points" ON public.user_points FOR ALL USING (true);

-- User streaks
CREATE POLICY "Users can view all streaks" ON public.user_streaks FOR SELECT USING (true);
CREATE POLICY "Users can update their own streaks" ON public.user_streaks FOR ALL USING (auth.uid() = user_id);

-- Challenges
CREATE POLICY "Everyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Only admins can manage challenges" ON public.challenges FOR ALL USING (has_role(auth.uid(), 'admin'::user_role_type));

-- Challenge progress
CREATE POLICY "Users can view all challenge progress" ON public.user_challenge_progress FOR SELECT USING (true);
CREATE POLICY "Users can update their own progress" ON public.user_challenge_progress FOR ALL USING (auth.uid() = user_id);

-- Leaderboards
CREATE POLICY "Everyone can view leaderboards" ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY "System can manage leaderboards" ON public.leaderboards FOR ALL USING (true);

-- Insert some default achievements for gamification
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, badge_color, slug) VALUES
('First Discovery', 'Made your first fact discovery', '🎯', 'discovery', 'facts_submitted', 1, '#10B981', 'first-discovery'),
('Local Expert', 'Discovered 10 facts in your area', '🏆', 'discovery', 'local_facts_submitted', 10, '#F59E0B', 'local-expert'),
('Viral Contributor', 'One of your facts got 100+ upvotes', '🚀', 'social', 'fact_upvotes', 100, '#EF4444', 'viral-contributor'),
('Fact Checker', 'Verified 25 facts', '✅', 'verification', 'facts_verified', 25, '#8B5CF6', 'fact-checker'),
('Social Butterfly', 'Received 50 comments on your facts', '🦋', 'social', 'comments_received', 50, '#EC4899', 'social-butterfly'),
('Explorer', 'Discovered facts in 5 different cities', '🗺️', 'discovery', 'cities_explored', 5, '#06B6D4', 'explorer'),
('Streak Master', 'Maintained a 7-day discovery streak', '🔥', 'streak', 'daily_streak', 7, '#F97316', 'streak-master'),
('Community Helper', 'Made 100 helpful comments', '💬', 'social', 'comments_made', 100, '#84CC16', 'community-helper'),
('Rising Star', 'Reached level 10', '⭐', 'level', 'user_level', 10, '#FBBF24', 'rising-star'),
('Legend', 'Reached level 50', '👑', 'level', 'user_level', 50, '#A855F7', 'legend');

-- Insert default challenges
INSERT INTO public.challenges (title, description, challenge_type, target_value, target_action, reward_points, start_date, end_date) VALUES
('Daily Explorer', 'Discover 1 new fact today', 'daily', 1, 'discover_facts', 50, now(), now() + interval '1 day'),
('Weekly Wanderer', 'Discover 5 facts this week', 'weekly', 5, 'discover_facts', 300, date_trunc('week', now()), date_trunc('week', now()) + interval '1 week'),
('Verification Hero', 'Verify 3 facts this week', 'weekly', 3, 'verify_facts', 200, date_trunc('week', now()), date_trunc('week', now()) + interval '1 week'),
('Social Engagement', 'Make 10 comments this week', 'weekly', 10, 'comment', 150, date_trunc('week', now()), date_trunc('week', now()) + interval '1 week');

-- Function to calculate XP requirement for level
CREATE OR REPLACE FUNCTION public.get_xp_for_level(level INTEGER)
RETURNS INTEGER
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT (level * 100) + ((level - 1) * 50);
$$;

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_level INTEGER;
  xp_required INTEGER;
BEGIN
  -- Calculate new level based on total XP
  new_level := 1;
  WHILE public.get_xp_for_level(new_level + 1) <= NEW.total_xp LOOP
    new_level := new_level + 1;
  END LOOP;
  
  -- Update level if changed
  IF new_level != NEW.current_level THEN
    NEW.current_level := new_level;
    NEW.current_xp := NEW.total_xp - public.get_xp_for_level(new_level);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-update user levels
CREATE TRIGGER update_user_level_trigger
  BEFORE UPDATE ON public.user_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- Function to award points and update XP
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_action_type TEXT,
  p_points INTEGER,
  p_description TEXT DEFAULT NULL,
  p_related_fact_id UUID DEFAULT NULL,
  p_related_comment_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert points record
  INSERT INTO public.user_points (user_id, action_type, points, description, related_fact_id, related_comment_id)
  VALUES (p_user_id, p_action_type, p_points, p_description, p_related_fact_id, p_related_comment_id);
  
  -- Update user level and XP
  INSERT INTO public.user_levels (user_id, total_xp)
  VALUES (p_user_id, p_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_xp = user_levels.total_xp + p_points,
    updated_at = now();
END;
$$;