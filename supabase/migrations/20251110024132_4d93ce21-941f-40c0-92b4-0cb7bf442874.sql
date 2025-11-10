-- Enable realtime for enhanced_notifications table
ALTER TABLE enhanced_notifications REPLICA IDENTITY FULL;

-- Notification trigger function for fact likes
CREATE OR REPLACE FUNCTION notify_fact_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if it's an upvote and not the author liking their own fact
  IF NEW.is_upvote = true THEN
    INSERT INTO enhanced_notifications (user_id, title, body, type, category, action_url, data)
    SELECT 
      f.author_id,
      'New Like! ❤️',
      u.username || ' liked your fact',
      'like',
      'social',
      '/fact/' || NEW.fact_id,
      jsonb_build_object('fact_id', NEW.fact_id, 'liker_id', NEW.user_id)
    FROM facts f
    LEFT JOIN profiles u ON u.id = NEW.user_id
    WHERE f.id = NEW.fact_id 
      AND f.author_id != NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification trigger function for comments
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify fact author
  INSERT INTO enhanced_notifications (user_id, title, body, type, category, action_url, data)
  SELECT 
    f.author_id,
    'New Comment 💬',
    u.username || ' commented on your fact',
    'comment',
    'social',
    '/fact/' || NEW.fact_id,
    jsonb_build_object('fact_id', NEW.fact_id, 'comment_id', NEW.id, 'commenter_id', NEW.author_id)
  FROM facts f
  LEFT JOIN profiles u ON u.id = NEW.author_id
  WHERE f.id = NEW.fact_id 
    AND f.author_id != NEW.author_id;

  -- If it's a reply, notify parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    INSERT INTO enhanced_notifications (user_id, title, body, type, category, action_url, data)
    SELECT 
      c.author_id,
      'Reply to Comment 💬',
      u.username || ' replied to your comment',
      'comment',
      'social',
      '/fact/' || NEW.fact_id,
      jsonb_build_object('fact_id', NEW.fact_id, 'comment_id', NEW.id, 'replier_id', NEW.author_id)
    FROM fact_comments c
    LEFT JOIN profiles u ON u.id = NEW.author_id
    WHERE c.id = NEW.parent_id 
      AND c.author_id != NEW.author_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Notification trigger for fact status updates (featured)
CREATE OR REPLACE FUNCTION notify_fact_featured()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO enhanced_notifications (user_id, title, body, type, category, action_url, data)
    VALUES (
      NEW.author_id,
      'Fact Featured! ⭐',
      'Your fact has been approved and is now visible to everyone!',
      'fact_featured',
      'content',
      '/fact/' || NEW.id,
      jsonb_build_object('fact_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_fact_like ON fact_reactions;
CREATE TRIGGER trigger_notify_fact_like
  AFTER INSERT ON fact_reactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_fact_like();

DROP TRIGGER IF EXISTS trigger_notify_new_comment ON fact_comments;
CREATE TRIGGER trigger_notify_new_comment
  AFTER INSERT ON fact_comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_comment();

DROP TRIGGER IF EXISTS trigger_notify_fact_featured ON facts;
CREATE TRIGGER trigger_notify_fact_featured
  AFTER UPDATE ON facts
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_fact_featured();