-- Direct messaging infrastructure for social hub
CREATE TABLE IF NOT EXISTS public.direct_message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users
);

CREATE TABLE IF NOT EXISTS public.direct_message_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.direct_message_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(thread_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.direct_message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users,
  recipient_id UUID REFERENCES auth.users,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Keep thread timestamps current when messages arrive
CREATE OR REPLACE FUNCTION public.update_direct_message_thread_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.direct_message_threads
     SET updated_at = NEW.created_at
   WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS direct_message_thread_touch ON public.direct_messages;
CREATE TRIGGER direct_message_thread_touch
AFTER INSERT ON public.direct_messages
FOR EACH ROW EXECUTE FUNCTION public.update_direct_message_thread_timestamp();

-- RLS policies
ALTER TABLE public.direct_message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_message_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Threads: participants can read, creator can insert/update
CREATE POLICY "Participants can view threads" ON public.direct_message_threads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.direct_message_participants p
      WHERE p.thread_id = id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage threads" ON public.direct_message_threads
  FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Participants: allow thread creator to add both participants and users to update their read state
CREATE POLICY "Participants can view participant rows" ON public.direct_message_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.direct_message_participants p
      WHERE p.thread_id = thread_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Creator can add participants" ON public.direct_message_participants
  FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT created_by FROM public.direct_message_threads t
      WHERE t.id = thread_id
    )
  );

CREATE POLICY "Participants can update their state" ON public.direct_message_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Messages: restrict to thread participants
CREATE POLICY "Participants can read messages" ON public.direct_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.direct_message_participants p
      WHERE p.thread_id = thread_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages" ON public.direct_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.direct_message_participants p
      WHERE p.thread_id = thread_id AND p.user_id = auth.uid()
    )
  );

-- Helper to ensure reciprocal participant exists when creating a thread
CREATE OR REPLACE FUNCTION public.get_or_create_direct_message_thread(target_user UUID)
RETURNS UUID AS $$
DECLARE
  existing_thread UUID;
  new_thread UUID;
BEGIN
  -- Reuse existing thread when both users already participate
  SELECT dmp.thread_id
    INTO existing_thread
    FROM public.direct_message_participants dmp
    JOIN public.direct_message_participants other
      ON other.thread_id = dmp.thread_id AND other.user_id = target_user
   WHERE dmp.user_id = auth.uid()
   LIMIT 1;

  IF existing_thread IS NOT NULL THEN
    RETURN existing_thread;
  END IF;

  -- Otherwise create a fresh thread and register both participants
  INSERT INTO public.direct_message_threads (created_by)
  VALUES (auth.uid())
  RETURNING id INTO new_thread;

  INSERT INTO public.direct_message_participants (thread_id, user_id, last_read_at)
  VALUES
    (new_thread, auth.uid(), now()),
    (new_thread, target_user, NULL);

  RETURN new_thread;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Inbox summary for messaging UI
CREATE OR REPLACE FUNCTION public.get_direct_message_threads()
RETURNS TABLE (
  thread_id UUID,
  updated_at TIMESTAMP WITH TIME ZONE,
  participant_id UUID,
  participant_username TEXT,
  participant_avatar_url TEXT,
  participant_bio TEXT,
  participant_created_at TIMESTAMP WITH TIME ZONE,
  participant_updated_at TIMESTAMP WITH TIME ZONE,
  participant_followers INTEGER,
  participant_following INTEGER,
  participant_reputation INTEGER,
  last_message_id UUID,
  last_message_content TEXT,
  last_message_sender UUID,
  last_message_type TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS thread_id,
    t.updated_at,
    other.user_id AS participant_id,
    prof.username,
    prof.avatar_url,
    prof.bio,
    prof.created_at,
    prof.updated_at,
    COALESCE(prof.followers_count, 0) AS participant_followers,
    COALESCE(prof.following_count, 0) AS participant_following,
    COALESCE(prof.reputation_score, 0) AS participant_reputation,
    last_msg.id AS last_message_id,
    last_msg.content AS last_message_content,
    last_msg.sender_id AS last_message_sender,
    last_msg.message_type AS last_message_type,
    last_msg.created_at AS last_message_at,
    COALESCE(unread.unread_count, 0) AS unread_count
  FROM public.direct_message_threads t
  JOIN public.direct_message_participants me
    ON me.thread_id = t.id AND me.user_id = auth.uid()
  JOIN public.direct_message_participants other
    ON other.thread_id = t.id AND other.user_id <> auth.uid()
  JOIN public.profiles prof ON prof.id = other.user_id
  LEFT JOIN LATERAL (
    SELECT dm.id, dm.content, dm.sender_id, dm.message_type, dm.created_at
    FROM public.direct_messages dm
    WHERE dm.thread_id = t.id
    ORDER BY dm.created_at DESC
    LIMIT 1
  ) last_msg ON TRUE
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS unread_count
    FROM public.direct_messages dm
    WHERE dm.thread_id = t.id
      AND dm.sender_id <> auth.uid()
      AND (me.last_read_at IS NULL OR dm.created_at > me.last_read_at)
  ) unread ON TRUE
  ORDER BY t.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

