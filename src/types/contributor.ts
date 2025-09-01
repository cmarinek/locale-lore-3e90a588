
export interface ExpertBadge {
  id: string;
  user_id: string;
  badge_type: 'local_expert' | 'verified_contributor' | 'super_contributor' | 'content_creator';
  location_area?: string;
  specialization?: string;
  verification_date: string;
  badge_level: number;
  requirements_met: string[];
  issued_by: string;
  expires_at?: string;
}

export interface Tip {
  id: string;
  sender_id: string;
  recipient_id: string;
  discovery_id?: string;
  amount: number;
  currency: string;
  message?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id?: string;
  created_at: string;
  processed_at?: string;
}

export interface PremiumContent {
  id: string;
  creator_id: string;
  discovery_id: string;
  content_type: 'detailed_guide' | 'exclusive_photos' | 'video_tour' | 'insider_tips';
  title: string;
  description: string;
  price: number;
  currency: string;
  content_url: string;
  preview_content?: string;
  purchase_count: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface SponsoredPartnership {
  id: string;
  creator_id: string;
  brand_id: string;
  campaign_type: 'location_feature' | 'discovery_showcase' | 'branded_content';
  title: string;
  description: string;
  budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  requirements: string[];
  deliverables: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface LocationClaim {
  id: string;
  user_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  business_name?: string;
  business_type?: string;
  claim_status: 'pending' | 'verified' | 'rejected';
  verification_documents: string[];
  claimed_at: string;
  verified_at?: string;
  verified_by?: string;
  benefits_enabled: {
    promotional_posts: boolean;
    special_offers: boolean;
    event_notifications: boolean;
    analytics_access: boolean;
  };
}

export interface CreatorAnalytics {
  user_id: string;
  period: string;
  discoveries_created: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  tips_received: number;
  tips_amount: number;
  premium_sales: number;
  premium_revenue: number;
  follower_growth: number;
  engagement_rate: number;
  top_performing_discoveries: {
    id: string;
    title: string;
    views: number;
    engagement: number;
  }[];
}

export interface RevenueShare {
  id: string;
  user_id: string;
  discovery_id: string;
  share_percentage: number;
  total_revenue: number;
  user_earnings: number;
  platform_earnings: number;
  period_start: string;
  period_end: string;
  status: 'calculated' | 'pending_payout' | 'paid';
  payout_date?: string;
  payout_method?: string;
}

export interface ContributorTier {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  min_discoveries: number;
  min_engagement_score: number;
  min_follower_count: number;
  benefits: {
    revenue_share_rate: number;
    priority_support: boolean;
    early_feature_access: boolean;
    custom_profile_features: boolean;
    verified_badge: boolean;
    tip_fee_reduction: number;
  };
}

export interface TipJar {
  id: string;
  user_id: string;
  display_name: string;
  description: string;
  suggested_amounts: number[];
  total_received: number;
  tip_count: number;
  is_enabled: boolean;
  custom_message?: string;
  created_at: string;
}
