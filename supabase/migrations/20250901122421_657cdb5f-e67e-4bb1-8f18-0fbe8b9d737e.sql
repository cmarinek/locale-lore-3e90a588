-- Add social features to the database

-- Add following/followers system
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add activity feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('fact_created', 'fact_liked', 'fact_commented', 'user_followed')),
  related_fact_id UUID REFERENCES facts(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add reactions table for more than just likes/dislikes
CREATE TABLE IF NOT EXISTS fact_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fact_id UUID NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('love', 'laugh', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, fact_id, reaction_type)
);

-- Add social sharing data table
CREATE TABLE IF NOT EXISTS fact_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  fact_id UUID NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_follows
CREATE POLICY "Users can view all follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others" ON user_follows FOR DELETE USING (auth.uid() = follower_id);

-- RLS Policies for activity_feed
CREATE POLICY "Users can view activity from people they follow" ON activity_feed 
  FOR SELECT USING (
    user_id IN (
      SELECT following_id FROM user_follows WHERE follower_id = auth.uid()
    ) OR user_id = auth.uid()
  );
CREATE POLICY "System can create activity" ON activity_feed FOR INSERT WITH CHECK (true);

-- RLS Policies for fact_reactions
CREATE POLICY "Everyone can view reactions" ON fact_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react to facts" ON fact_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their reactions" ON fact_reactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their reactions" ON fact_reactions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for fact_shares
CREATE POLICY "Users can view all shares" ON fact_shares FOR SELECT USING (true);
CREATE POLICY "Users can share facts" ON fact_shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_created ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fact_reactions_fact ON fact_reactions(fact_id);
CREATE INDEX IF NOT EXISTS idx_fact_shares_fact ON fact_shares(fact_id);

-- Add follower/following counts to profiles (we'll update these with triggers)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for the user being followed
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    -- Increment following count for the user doing the following
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count for the user being unfollowed
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    -- Decrement following count for the user doing the unfollowing
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update follow counts
DROP TRIGGER IF EXISTS update_follow_counts_trigger ON user_follows;
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Function to create activity feed entries
CREATE OR REPLACE FUNCTION create_activity_feed_entry()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'facts' THEN
      INSERT INTO activity_feed (user_id, activity_type, related_fact_id)
      VALUES (NEW.author_id, 'fact_created', NEW.id);
    ELSIF TG_TABLE_NAME = 'votes' AND NEW.is_upvote = true THEN
      INSERT INTO activity_feed (user_id, activity_type, related_fact_id)
      VALUES (NEW.user_id, 'fact_liked', NEW.fact_id);
    ELSIF TG_TABLE_NAME = 'fact_comments' THEN
      INSERT INTO activity_feed (user_id, activity_type, related_fact_id)
      VALUES (NEW.author_id, 'fact_commented', NEW.fact_id);
    ELSIF TG_TABLE_NAME = 'user_follows' THEN
      INSERT INTO activity_feed (user_id, activity_type, related_user_id)
      VALUES (NEW.follower_id, 'user_followed', NEW.following_id);
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to create activity feed entries
DROP TRIGGER IF EXISTS facts_activity_trigger ON facts;
CREATE TRIGGER facts_activity_trigger
  AFTER INSERT ON facts
  FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();

DROP TRIGGER IF EXISTS votes_activity_trigger ON votes;
CREATE TRIGGER votes_activity_trigger
  AFTER INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();

DROP TRIGGER IF EXISTS comments_activity_trigger ON fact_comments;
CREATE TRIGGER comments_activity_trigger
  AFTER INSERT ON fact_comments
  FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();

DROP TRIGGER IF EXISTS follows_activity_trigger ON user_follows;
CREATE TRIGGER follows_activity_trigger
  AFTER INSERT ON user_follows
  FOR EACH ROW EXECUTE FUNCTION create_activity_feed_entry();