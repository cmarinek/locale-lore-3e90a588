
-- Create expert badges table
CREATE TABLE public.expert_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('local_expert', 'verified_contributor', 'super_contributor', 'content_creator')),
  location_area TEXT,
  specialization TEXT,
  verification_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  badge_level INTEGER NOT NULL DEFAULT 1,
  requirements_met TEXT[] NOT NULL DEFAULT '{}',
  issued_by UUID REFERENCES auth.users NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tips table
CREATE TABLE public.tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  discovery_id UUID REFERENCES public.facts,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create premium content table
CREATE TABLE public.premium_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users NOT NULL,
  discovery_id UUID REFERENCES public.facts NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('detailed_guide', 'exclusive_photos', 'video_tour', 'insider_tips')),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  content_url TEXT NOT NULL,
  preview_content TEXT,
  purchase_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sponsored partnerships table
CREATE TABLE public.sponsored_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users NOT NULL,
  brand_id UUID REFERENCES auth.users NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('location_feature', 'discovery_showcase', 'branded_content')),
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  requirements TEXT[] NOT NULL DEFAULT '{}',
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create location claims table
CREATE TABLE public.location_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  location_name TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  business_name TEXT,
  business_type TEXT,
  claim_status TEXT NOT NULL DEFAULT 'pending' CHECK (claim_status IN ('pending', 'verified', 'rejected')),
  verification_documents TEXT[] NOT NULL DEFAULT '{}',
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users,
  benefits_enabled JSONB NOT NULL DEFAULT '{"promotional_posts": false, "special_offers": false, "event_notifications": false, "analytics_access": false}'
);

-- Create tip jars table
CREATE TABLE public.tip_jars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  suggested_amounts INTEGER[] NOT NULL DEFAULT '{1,3,5,10,25}',
  total_received DECIMAL(10,2) NOT NULL DEFAULT 0,
  tip_count INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.expert_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsored_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tip_jars ENABLE ROW LEVEL SECURITY;

-- Expert badges policies
CREATE POLICY "Users can view all expert badges" ON public.expert_badges FOR SELECT USING (true);
CREATE POLICY "Admins can manage expert badges" ON public.expert_badges FOR ALL USING (auth.uid() IN (SELECT user_id FROM profiles WHERE role = 'admin'));

-- Tips policies
CREATE POLICY "Users can view tips they sent or received" ON public.tips FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create tips" ON public.tips FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Premium content policies
CREATE POLICY "Users can view all premium content" ON public.premium_content FOR SELECT USING (true);
CREATE POLICY "Creators can manage their premium content" ON public.premium_content FOR ALL USING (auth.uid() = creator_id);

-- Sponsored partnerships policies
CREATE POLICY "Users can view partnerships they're involved in" ON public.sponsored_partnerships FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = brand_id);
CREATE POLICY "Users can create partnerships" ON public.sponsored_partnerships FOR INSERT WITH CHECK (auth.uid() = creator_id OR auth.uid() = brand_id);
CREATE POLICY "Users can update partnerships they're involved in" ON public.sponsored_partnerships FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() = brand_id);

-- Location claims policies
CREATE POLICY "Users can view all location claims" ON public.location_claims FOR SELECT USING (true);
CREATE POLICY "Users can create location claims" ON public.location_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their location claims" ON public.location_claims FOR UPDATE USING (auth.uid() = user_id);

-- Tip jars policies
CREATE POLICY "Users can view all tip jars" ON public.tip_jars FOR SELECT USING (true);
CREATE POLICY "Users can manage their tip jar" ON public.tip_jars FOR ALL USING (auth.uid() = user_id);

-- Create edge function for processing tips
CREATE OR REPLACE FUNCTION public.process_tip(
  p_recipient_id UUID,
  p_discovery_id UUID,
  p_amount DECIMAL,
  p_currency TEXT,
  p_message TEXT
) RETURNS JSON AS $$
DECLARE
  tip_id UUID;
  checkout_url TEXT;
BEGIN
  -- Insert tip record
  INSERT INTO public.tips (sender_id, recipient_id, discovery_id, amount, currency, message)
  VALUES (auth.uid(), p_recipient_id, p_discovery_id, p_amount, p_currency, p_message)
  RETURNING id INTO tip_id;
  
  -- In a real implementation, this would create a Stripe checkout session
  -- For now, return a mock checkout URL
  checkout_url := 'https://checkout.stripe.com/mock/' || tip_id;
  
  RETURN json_build_object('checkout_url', checkout_url, 'tip_id', tip_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
