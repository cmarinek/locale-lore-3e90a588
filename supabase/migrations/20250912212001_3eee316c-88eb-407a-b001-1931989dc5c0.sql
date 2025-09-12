-- Customer Support System Database Schema

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'general',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  user_name TEXT
);

-- Support ticket messages table
CREATE TABLE public.support_ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  is_staff_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attachments JSONB DEFAULT '[]'::jsonb
);

-- FAQ table
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0
);

-- User feedback table
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL,
  rating INTEGER,
  message TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Feature requests table
CREATE TABLE public.feature_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'enhancement',
  status TEXT NOT NULL DEFAULT 'submitted',
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feature request votes table
CREATE TABLE public.feature_request_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_request_id UUID NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feature_request_id, user_id)
);

-- Bug reports table
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  browser_info JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets" ON public.support_tickets 
  FOR SELECT USING (auth.uid() = user_id OR user_email = auth.email());

CREATE POLICY "Users can create their own tickets" ON public.support_tickets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all tickets" ON public.support_tickets 
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Staff can update all tickets" ON public.support_tickets 
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- RLS Policies for support_ticket_messages
CREATE POLICY "Users can view messages for their tickets" ON public.support_ticket_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND (user_id = auth.uid() OR user_email = auth.email())
    ) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Users can create messages for their tickets" ON public.support_ticket_messages 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND (user_id = auth.uid() OR user_email = auth.email())
    ) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator')
  );

-- RLS Policies for FAQ
CREATE POLICY "Everyone can view FAQ items" ON public.faq_items 
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage FAQ items" ON public.faq_items 
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for user_feedback
CREATE POLICY "Users can create feedback" ON public.user_feedback 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own feedback" ON public.user_feedback 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all feedback" ON public.user_feedback 
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- RLS Policies for feature_requests
CREATE POLICY "Everyone can view feature requests" ON public.feature_requests 
  FOR SELECT USING (true);

CREATE POLICY "Users can create feature requests" ON public.feature_requests 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors and staff can update feature requests" ON public.feature_requests 
  FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- RLS Policies for feature_request_votes
CREATE POLICY "Everyone can view votes" ON public.feature_request_votes 
  FOR SELECT USING (true);

CREATE POLICY "Users can vote on feature requests" ON public.feature_request_votes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes" ON public.feature_request_votes 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bug_reports
CREATE POLICY "Users can view their own bug reports" ON public.bug_reports 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bug reports" ON public.bug_reports 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all bug reports" ON public.bug_reports 
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

CREATE POLICY "Staff can update bug reports" ON public.bug_reports 
  FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON public.feature_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample FAQ data
INSERT INTO public.faq_items (question, answer, category, order_index, is_featured) VALUES 
('How do I submit a new fact?', 'To submit a new fact, navigate to the Submit page and fill out the required information including location, title, description, and any supporting media.', 'general', 1, true),
('How does fact verification work?', 'Facts go through a community verification process where other users can vote to verify or dispute the information. Facts with higher verification scores are promoted.', 'verification', 2, true),
('Can I edit my submitted facts?', 'Yes, you can edit your own submitted facts as long as they have not been verified. Once verified, only moderators can make changes.', 'general', 3, false),
('How do I report inappropriate content?', 'You can report inappropriate content by clicking the report button on any fact or comment. Our moderation team will review reports promptly.', 'moderation', 4, true),
('What types of locations can I add facts about?', 'You can add facts about any physical location worldwide - landmarks, historical sites, natural features, buildings, neighborhoods, and more.', 'general', 5, false),
('How do I contact support?', 'You can contact support through this help center by submitting a support ticket, or by using the feedback form available throughout the app.', 'support', 6, true);