-- Add indexes for leaderboard performance optimization

-- Index on user_levels for XP leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_levels_total_xp ON user_levels(total_xp DESC);

-- Index on user_statistics for various leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_statistics_facts_submitted ON user_statistics(facts_submitted DESC);
CREATE INDEX IF NOT EXISTS idx_user_statistics_current_streak ON user_statistics(current_streak DESC);

-- Index on profiles for reputation leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_reputation_score ON profiles(reputation_score DESC);

-- Index on leaderboards table for efficient filtering
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_rank ON leaderboards(leaderboard_type, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboards_user_type ON leaderboards(user_id, leaderboard_type);

-- Enable realtime for leaderboards table
ALTER TABLE leaderboards REPLICA IDENTITY FULL;

-- Add leaderboards table to realtime publication (if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'leaderboards'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE leaderboards;
  END IF;
END $$;