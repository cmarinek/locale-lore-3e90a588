-- Enhanced Notification System - Building on existing infrastructure
-- Inspired by Spotify, Facebook, Instagram, Shopify notification systems

-- Create notification priority enum (if not exists)
DO $$ BEGIN
    CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notification status enum (if not exists)
DO $$ BEGIN
    CREATE TYPE notification_status AS ENUM ('pending', 'delivered', 'read', 'clicked', 'dismissed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create comprehensive notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  
  -- Frequency settings
  digest_frequency TEXT DEFAULT 'daily', -- 'never', 'daily', 'weekly'
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  timezone TEXT DEFAULT 'UTC',
  
  -- Category preferences (JSONB for flexibility)
  category_preferences JSONB DEFAULT '{
    "social": {"email": true, "push": true, "in_app": true},
    "content": {"email": true, "push": false, "in_app": true},
    "system": {"email": true, "push": true, "in_app": true},
    "marketing": {"email": false, "push": false, "in_app": false},
    "security": {"email": true, "push": true, "in_app": true}
  }'::jsonb,
  
  -- Smart features
  smart_bundling_enabled BOOLEAN DEFAULT true,
  location_based_enabled BOOLEAN DEFAULT true,
  ai_optimization_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced notifications table with advanced features
CREATE TABLE IF NOT EXISTS public.enhanced_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Core notification data
  type TEXT NOT NULL, -- Using TEXT to work with existing enum
  priority notification_priority DEFAULT 'normal',
  status notification_status DEFAULT 'pending',
  
  -- Content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  icon_url TEXT,
  action_url TEXT,
  
  -- Rich data payload
  data JSONB DEFAULT '{}'::jsonb,
  
  -- Targeting and context
  category TEXT NOT NULL, -- 'social', 'content', 'system', 'marketing', 'security'
  tags TEXT[] DEFAULT '{}',
  context JSONB DEFAULT '{}'::jsonb, -- user location, device, etc.
  
  -- Delivery tracking
  scheduled_for TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement metrics
  view_duration_seconds INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  
  -- Bundling and grouping
  bundle_id UUID,
  group_key TEXT, -- for grouping similar notifications
  
  -- Delivery channels used
  channels_used TEXT[] DEFAULT '{}', -- ['email', 'push', 'in_app']
  
  -- Metadata
  source_app TEXT DEFAULT 'web',
  campaign_id TEXT,
  experiment_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days')
);

-- Notification bundles for smart grouping (like Instagram's bundled likes)
CREATE TABLE IF NOT EXISTS public.notification_bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Bundle metadata
  title TEXT NOT NULL, -- "3 people liked your fact"
  summary TEXT NOT NULL, -- "John, Sarah and 1 other person liked..."
  type TEXT NOT NULL, -- Using TEXT to work with existing enum
  category TEXT NOT NULL,
  
  -- Bundle settings
  max_notifications INTEGER DEFAULT 5,
  collapse_after_count INTEGER DEFAULT 3,
  
  -- Status
  notification_count INTEGER DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Push notification subscriptions (Web Push API)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Push subscription data
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  
  -- Device/browser info
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  os TEXT,
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  failure_count INTEGER DEFAULT 0
);

-- Notification analytics for optimization
CREATE TABLE IF NOT EXISTS public.notification_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL,
  user_id UUID NOT NULL,
  
  -- Event tracking
  event_type TEXT NOT NULL, -- 'delivered', 'viewed', 'clicked', 'dismissed', 'expired'
  channel TEXT NOT NULL, -- 'email', 'push', 'in_app', 'sms'
  
  -- Context
  device_type TEXT,
  browser TEXT,
  location_country TEXT,
  location_city TEXT,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own enhanced notifications" 
ON public.enhanced_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own enhanced notification status" 
ON public.enhanced_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create enhanced notifications" 
ON public.enhanced_notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own notification bundles" 
ON public.notification_bundles 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification analytics" 
ON public.notification_analytics 
FOR SELECT 
USING (auth.uid() = user_id);