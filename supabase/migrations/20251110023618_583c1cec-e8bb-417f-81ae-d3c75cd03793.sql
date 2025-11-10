-- Create rewards catalog table
CREATE TABLE IF NOT EXISTS rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cost_points INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('badge', 'title', 'avatar_border', 'feature_unlock')),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_one_time BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;

-- Everyone can view active rewards
CREATE POLICY "Anyone can view active rewards"
  ON rewards_catalog FOR SELECT
  USING (is_active = true);

-- Only admins can manage rewards
CREATE POLICY "Admins can manage rewards"
  ON rewards_catalog FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create user rewards table
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards_catalog(id),
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  points_spent INTEGER NOT NULL,
  UNIQUE(user_id, reward_id) -- Prevent duplicate redemptions for one-time rewards
);

-- Enable RLS
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Users can view their own rewards
CREATE POLICY "Users can view own rewards"
  ON user_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Users can redeem rewards (insert handled by edge function for validation)
CREATE POLICY "Authenticated users can redeem rewards"
  ON user_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_reward_id ON user_rewards(reward_id);
CREATE INDEX idx_rewards_catalog_active ON rewards_catalog(is_active);

-- Seed initial rewards
INSERT INTO rewards_catalog (name, description, cost_points, reward_type, is_one_time, metadata) VALUES
  ('Golden Border', 'Unlock a premium golden avatar border', 100, 'avatar_border', false, '{"border_color": "#FFD700", "border_width": "3px"}'::jsonb),
  ('Legend', 'Unlock the exclusive "Legend" title for your profile', 250, 'title', false, '{"title": "Legend", "color": "#9333ea"}'::jsonb),
  ('Star Explorer', 'Earn the prestigious Star Explorer badge', 500, 'badge', false, '{"badge_icon": "star", "badge_color": "#3b82f6"}'::jsonb),
  ('Premium Theme', 'Unlock premium app themes and customization', 1000, 'feature_unlock', false, '{"feature": "premium_themes"}'::jsonb),
  ('Diamond Border', 'Unlock a rare diamond-studded avatar border', 750, 'avatar_border', false, '{"border_color": "#60a5fa", "border_style": "double"}'::jsonb),
  ('Elite Contributor', 'Unlock the "Elite Contributor" title', 1500, 'title', false, '{"title": "Elite Contributor", "color": "#ef4444"}'::jsonb)
ON CONFLICT DO NOTHING;