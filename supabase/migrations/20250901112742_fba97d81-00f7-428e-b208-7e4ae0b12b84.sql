-- Create user reputation and achievements system
CREATE TABLE public.user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_score INTEGER DEFAULT 0,
  votes_cast INTEGER DEFAULT 0,
  votes_received INTEGER DEFAULT 0,
  facts_verified INTEGER DEFAULT 0,
  comments_made INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create achievements system
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'voting', 'verification', 'community', 'streak'
  requirement_type TEXT NOT NULL, -- 'count', 'streak', 'special'
  requirement_value INTEGER,
  badge_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user achievements junction table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create enhanced comments system with nested replies
CREATE TABLE public.fact_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.fact_comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  vote_count_up INTEGER DEFAULT 0,
  vote_count_down INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  depth INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create comment votes table
CREATE TABLE public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.fact_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_upvote BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Create rate limiting table for anti-spam
CREATE TABLE public.user_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'vote', 'comment', 'fact_submit'
  action_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_action TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_type)
);

-- Create verification requests table
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL,
  evidence_text TEXT,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User reputation policies
CREATE POLICY "Users can view all reputation scores" ON public.user_reputation FOR SELECT USING (true);
CREATE POLICY "Users can update their own reputation" ON public.user_reputation FOR ALL USING (auth.uid() = user_id);

-- Achievement policies  
CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Users can view all user achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "System can manage user achievements" ON public.user_achievements FOR ALL USING (true);

-- Comment policies
CREATE POLICY "Everyone can view comments" ON public.fact_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.fact_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their comments" ON public.fact_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors and admins can delete comments" ON public.fact_comments FOR DELETE USING (auth.uid() = author_id);

-- Comment vote policies
CREATE POLICY "Everyone can view comment votes" ON public.comment_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote on comments" ON public.comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their comment votes" ON public.comment_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their comment votes" ON public.comment_votes FOR DELETE USING (auth.uid() = user_id);

-- Rate limiting policies
CREATE POLICY "Users can view their own rate limits" ON public.user_rate_limits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage rate limits" ON public.user_rate_limits FOR ALL USING (true);

-- Verification request policies
CREATE POLICY "Everyone can view verification requests" ON public.verification_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create verification requests" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = requested_by);
CREATE POLICY "Authors can update their verification requests" ON public.verification_requests FOR UPDATE USING (auth.uid() = requested_by);

-- Insert initial achievements
INSERT INTO public.achievements (slug, name, description, icon, category, requirement_type, requirement_value, badge_color) VALUES
('first_vote', 'First Vote', 'Cast your first vote on community content', '🗳️', 'voting', 'count', 1, '#3B82F6'),
('veteran_voter', 'Veteran Voter', 'Cast 100 votes on community content', '🏆', 'voting', 'count', 100, '#8B5CF6'),
('fact_checker', 'Fact Checker', 'Help verify 10 community submissions', '✅', 'verification', 'count', 10, '#10B981'),
('community_champion', 'Community Champion', 'Receive 50 upvotes on your comments', '👑', 'community', 'count', 50, '#F59E0B'),
('streak_warrior', '7-Day Streak', 'Maintain a 7-day activity streak', '🔥', 'streak', 'streak', 7, '#EF4444'),
('discussion_starter', 'Discussion Starter', 'Start meaningful conversations with 25 comments', '💬', 'community', 'count', 25, '#06B6D4'),
('truth_seeker', 'Truth Seeker', 'Submit evidence for 5 verification requests', '🔍', 'verification', 'count', 5, '#8B5CF6');