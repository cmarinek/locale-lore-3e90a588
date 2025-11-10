-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they're part of
CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendship requests
CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they're part of (respond to requests)
CREATE POLICY "Users can respond to friend requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = friend_id OR auth.uid() = user_id);

-- Users can delete their own friendships
CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create indexes for performance
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Create trigger to notify on friend request
CREATE OR REPLACE FUNCTION notify_friend_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when new friend request is created
  IF NEW.status = 'pending' THEN
    INSERT INTO enhanced_notifications (user_id, title, body, type, category, action_url, data)
    SELECT 
      NEW.friend_id,
      'New Friend Request 👋',
      u.username || ' sent you a friend request',
      'friend_request',
      'social',
      '/profile/' || NEW.user_id,
      jsonb_build_object('requester_id', NEW.user_id, 'friendship_id', NEW.id)
    FROM profiles u
    WHERE u.id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to notify on friend request response
CREATE OR REPLACE FUNCTION notify_friend_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when friend request is accepted
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO enhanced_notifications (user_id, title, body, type, category, action_url, data)
    SELECT 
      NEW.user_id,
      'Friend Request Accepted! 🎉',
      u.username || ' accepted your friend request',
      'friend_request',
      'social',
      '/profile/' || NEW.friend_id,
      jsonb_build_object('friend_id', NEW.friend_id, 'friendship_id', NEW.id)
    FROM profiles u
    WHERE u.id = NEW.friend_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
DROP TRIGGER IF EXISTS trigger_notify_friend_request ON friendships;
CREATE TRIGGER trigger_notify_friend_request
  AFTER INSERT ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION notify_friend_request();

DROP TRIGGER IF EXISTS trigger_notify_friend_response ON friendships;
CREATE TRIGGER trigger_notify_friend_response
  AFTER UPDATE ON friendships
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_friend_response();