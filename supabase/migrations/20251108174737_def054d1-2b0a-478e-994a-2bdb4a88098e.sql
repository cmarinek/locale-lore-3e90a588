-- Create tips table
CREATE TABLE IF NOT EXISTS public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discovery_id UUID REFERENCES public.facts(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tips_sender ON public.tips(sender_id);
CREATE INDEX IF NOT EXISTS idx_tips_recipient ON public.tips(recipient_id);
CREATE INDEX IF NOT EXISTS idx_tips_discovery ON public.tips(discovery_id);

ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tips they sent or received"
  ON public.tips FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create tips"
  ON public.tips FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create tip_jars table
CREATE TABLE IF NOT EXISTS public.tip_jars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  description TEXT,
  suggested_amounts NUMERIC[] DEFAULT ARRAY[5, 10, 20],
  total_received NUMERIC(10,2) NOT NULL DEFAULT 0,
  tip_count INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  custom_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tip_jars_user ON public.tip_jars(user_id);

ALTER TABLE public.tip_jars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view enabled tip jars"
  ON public.tip_jars FOR SELECT
  USING (is_enabled = true);

CREATE POLICY "Users can manage their own tip jar"
  ON public.tip_jars FOR ALL
  USING (auth.uid() = user_id);

-- Create premium_content table
CREATE TABLE IF NOT EXISTS public.premium_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  discovery_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('detailed_guide', 'exclusive_photos', 'video_tour', 'insider_tips')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  content_url TEXT NOT NULL,
  preview_content TEXT,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_premium_content_creator ON public.premium_content(creator_id);
CREATE INDEX IF NOT EXISTS idx_premium_content_discovery ON public.premium_content(discovery_id);

ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view premium content listings"
  ON public.premium_content FOR SELECT
  USING (true);

CREATE POLICY "Creators can manage their own premium content"
  ON public.premium_content FOR ALL
  USING (auth.uid() = creator_id);

-- Create expert_badges table
CREATE TABLE IF NOT EXISTS public.expert_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('local_expert', 'verified_contributor', 'super_contributor', 'content_creator')),
  location_area TEXT,
  specialization TEXT,
  verification_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  badge_level INTEGER NOT NULL DEFAULT 1 CHECK (badge_level > 0),
  requirements_met TEXT[] NOT NULL DEFAULT '{}',
  issued_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_expert_badges_user ON public.expert_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_badges_type ON public.expert_badges(badge_type);

ALTER TABLE public.expert_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view expert badges"
  ON public.expert_badges FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own badges for management"
  ON public.expert_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Create location_claims table
CREATE TABLE IF NOT EXISTS public.location_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  latitude NUMERIC(10,8) NOT NULL,
  longitude NUMERIC(11,8) NOT NULL,
  business_name TEXT,
  business_type TEXT,
  claim_status TEXT NOT NULL DEFAULT 'pending' CHECK (claim_status IN ('pending', 'verified', 'rejected')),
  verification_documents TEXT[] DEFAULT '{}',
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  benefits_enabled JSONB DEFAULT '{"promotional_posts": false, "special_offers": false, "event_notifications": false, "analytics_access": false}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_location_claims_user ON public.location_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_location_claims_status ON public.location_claims(claim_status);

ALTER TABLE public.location_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own location claims"
  ON public.location_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create location claims"
  ON public.location_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending claims"
  ON public.location_claims FOR UPDATE
  USING (auth.uid() = user_id AND claim_status = 'pending');

-- Create sponsored_partnerships table
CREATE TABLE IF NOT EXISTS public.sponsored_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('location_feature', 'discovery_showcase', 'branded_content')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC(10,2) NOT NULL CHECK (budget >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  deliverables TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsored_partnerships_creator ON public.sponsored_partnerships(creator_id);
CREATE INDEX IF NOT EXISTS idx_sponsored_partnerships_status ON public.sponsored_partnerships(status);

ALTER TABLE public.sponsored_partnerships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own partnerships"
  ON public.sponsored_partnerships FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage their own partnerships"
  ON public.sponsored_partnerships FOR ALL
  USING (auth.uid() = creator_id);

-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_direct_messages_thread ON public.direct_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created ON public.direct_messages(created_at DESC);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received"
  ON public.direct_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.direct_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = recipient_id);